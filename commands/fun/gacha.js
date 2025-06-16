const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { withDatabase, dbConfig } = require("../../utils/database");
const { isGuildAllowed } = require("../../utils/permissions")
const sql = require("mssql")

module.exports = {
  data: new SlashCommandBuilder().setName("gacha").setDescription("Tarik karakter gacha!"),

  async execute(interaction, client) {
    // Check if guild is allowed
    if (!isGuildAllowed(interaction.guildId)) {
      return interaction.reply({
        content: "❌ Perintah ini hanya dapat digunakan di server yang diizinkan!",
        ephemeral: true,
      })
    }

    const user = interaction.user
    const now = Date.now()

    // Check cooldown
    const cooldown = client.cooldowns.get(user.id) || 0
    if (now < cooldown) {
      return interaction.reply({
        content: `⏳ Tunggu ${((cooldown - now) / 1000).toFixed(1)} detik sebelum gacha lagi!`,
        ephemeral: true,
      })
    }

    // Check gacha limits
    const limitData = client.gachaLimits.get(user.id) || { count: 0, resetTime: now + 600000 }
    if (now > limitData.resetTime) {
      client.gachaLimits.set(user.id, { count: 1, resetTime: now + 600000 })
    } else if (limitData.count >= 10) {
      return interaction.reply({
        content: "⚠️ Kamu sudah mencapai batas 10 gacha dalam 10 menit!",
        ephemeral: true,
      })
    } else {
      client.gachaLimits.set(user.id, { count: limitData.count + 1, resetTime: limitData.resetTime })
    }

    // Set cooldown
    client.cooldowns.set(user.id, now + 2000)

    try {
      await withDatabase(dbConfig, async (pool) => {
        // Get list of characters already owned by user
        const ownedCharacters = await pool
          .request()
          .input("userId", sql.VarChar, user.username)
          .query("SELECT character_id FROM UserCharacters WHERE user_id = @userId")

        const ownedCharacterIds = ownedCharacters.recordset.map((row) => row.character_id)

        // Select a character not owned by the user
        let query
        if (ownedCharacterIds.length > 0) {
          query = `SELECT TOP 1 * FROM Characters WHERE id NOT IN (${ownedCharacterIds.join(",")}) ORDER BY NEWID()`
        } else {
          query = `SELECT TOP 1 * FROM Characters ORDER BY NEWID()`
        }

        const result = await pool.request().query(query)

        if (result.recordset.length > 0) {
          const character = result.recordset[0]

          const embed = new EmbedBuilder()
            .setTitle(`🎲 Gacha!`)
            .setDescription(`Siapa cepat dia dapat! Klik 👍 untuk mendapatkan **${character.name}**!`)
            .setImage(character.image_url)
            .setColor("#FFD700")

          const message = await interaction.reply({ embeds: [embed], fetchReply: true })
          await message.react("👍")

          // Event collector for reactions
          const filter = (reaction, reactor) => reaction.emoji.name === "👍" && !reactor.bot
          const collector = message.createReactionCollector({ filter, max: 1, time: 10000 })

          collector.on("collect", async (reaction, reactor) => {
          try {
            await withDatabase(dbConfig, async (pool) => {
              await pool
                .request()
                .input("userId", sql.VarChar, reactor.username)
                .input("characterId", sql.Int, character.id)
                .query("INSERT INTO UserCharacters (user_id, character_id, obtained_at) VALUES (@userId, @characterId, GETDATE())")
            })

            await interaction.followUp(`🎉 <@${reactor.id}> mendapatkan **${character.name}**!`)
          } catch (err) {
            console.error(err)
            await interaction.followUp("❌ Terjadi kesalahan saat menyimpan karakter!")
          }
        })


          collector.on("end", (collected) => {
            if (collected.size === 0) {
              interaction.followUp("⌛ Waktu habis! Tidak ada yang mendapatkan karakter.")
            }
          })
        } else {
          await interaction.reply("⚠️ Tidak ada karakter yang tersedia dalam database!")
        }
      })
    } catch (err) {
      console.error(err)
      await interaction.reply("❌ Terjadi kesalahan saat mengambil karakter!")
    }
  },
}
