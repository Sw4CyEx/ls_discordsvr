const { SlashCommandBuilder } = require("@discordjs/builders")
const { withDatabase, dbConfig } = require("../../utils/database");
const sql = require("mssql")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jual")
    .setDescription("Jual karakter untuk mendapatkan PESO!")
    .addIntegerOption((option) =>
      option.setName("character_id").setDescription("masukan id character.").setRequired(true),
    ),

  async execute(interaction, client) {
    const characterId = interaction.options.getInteger("character_id")
    const user = interaction.user

    try {
      await withDatabase(dbConfig, async (pool) => {
        // Validate if character is owned by user
        const userCharResult = await pool
          .request()
          .input("userId", sql.VarChar, user.username)
          .input("characterId", sql.Int, characterId)
          .query("SELECT * FROM UserCharacters WHERE user_id = @userId AND character_id = @characterId")

        if (userCharResult.recordset.length === 0) {
          return await interaction.reply("⚠️ Kamu tidak memiliki karakter ini! Transaksi dibatalkan.")
        }

        const charResult = await pool
          .request()
          .input("characterId", sql.Int, characterId)
          .query("SELECT * FROM Characters WHERE id = @characterId")

        if (charResult.recordset.length === 0) {
          return await interaction.reply("⚠️ Karakter tidak ditemukan!")
        }

        const character = charResult.recordset[0]
        const pesoValue = character.sell_price
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + 1);


        // Remove character from user collection
        await pool
          .request()
          .input("userId", sql.VarChar, user.username)
          .input("characterId", sql.Int, characterId)
          .query("DELETE FROM UserCharacters WHERE user_id = @userId AND character_id = @characterId")

        // Give user PESO in exchange for character
        await pool
          .request()
          .input("sendNick", sql.VarChar, "DeveloperK")
          .input("receiveNick", sql.VarChar, user.username)
          .input("persentType", sql.SmallInt, 4)
          .input("value1", sql.Int, pesoValue)
          .input("value2", sql.Int, 1)
          .input("value3", sql.Int, 0)
          .input("value4", sql.Int, 0)
          .input("msgType", sql.Int, 202)
          .input("flag", sql.Int, 0)
          .input("limitDate", sql.DateTime, limitDate) 
          .execute("elaim_saga_giveaway_add")

        await interaction.reply(`💰 Kamu telah menjual **${character.name}** seharga **${pesoValue} PESO**!`)
      })
    } catch (err) {
      console.error(err)
      await interaction.reply("❌ Terjadi kesalahan saat menjual karakter!")
    }
  },
}
