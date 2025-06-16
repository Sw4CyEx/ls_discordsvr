const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { withDatabase, dbConfig } = require("../../utils/database")
const { hasPermission } = require("../../utils/permissions")
const sql = require("mssql")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveitem")
    .setDescription("Memberikan item kepada pengguna")
    .addStringOption((option) =>
      option.setName("player_nick").setDescription("Nama pengguna yang menerima item").setRequired(true),
    )
    .addIntegerOption((option) => option.setName("type_item").setDescription("Tipe hadiah").setRequired(true))
    .addIntegerOption((option) => option.setName("code_item").setDescription("Kode item").setRequired(true))
    .addIntegerOption((option) => option.setName("qty").setDescription("Jumlah hadiah").setRequired(true)),

  async execute(interaction) {
    if (!hasPermission(interaction.user.id, "ALLOWED_USERS")) {
      return interaction.reply({
        content: "Anda tidak memiliki izin untuk menjalankan giveitem.",
        ephemeral: true,
      })
    }

    const playerNick = interaction.options.getString("player_nick")
    const typeItem = interaction.options.getInteger("type_item")
    const codeItem = interaction.options.getInteger("code_item")
    const qty = interaction.options.getInteger("qty")

    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() + 3)

    try {
      console.log("🛠️ Mengirim hadiah ke:", playerNick)
      await withDatabase(dbConfig, async (pool) => {
        await pool
          .request()
          .input("sendNick", sql.VarChar, "DeveloperK")
          .input("receiveNick", sql.VarChar, playerNick)
          .input("persentType", sql.SmallInt, typeItem)
          .input("value1", sql.Int, codeItem)
          .input("value2", sql.Int, qty)
          .input("value3", sql.Int, 0)
          .input("value4", sql.Int, 0)
          .input("msgType", sql.Int, 202)
          .input("flag", sql.Int, 0)
          .input("limitDate", sql.DateTime, limitDate.toISOString())
          .execute("aslantia_web_present_add")

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("Hadiah Terkirim!")
          .setDescription(`Hadiah berhasil dikirim dari **DeveloperK** ke **${playerNick}**.`)
          .addFields(
            { name: "Jumlah Hadiah", value: `${qty}`, inline: true },
            { name: "Tipe Hadiah", value: `${typeItem}`, inline: true },
            { name: "Kode Hadiah", value: `${codeItem}`, inline: true },
          )
          .setFooter({ text: `Hadiah akan kedaluwarsa pada ${limitDate.toISOString()}` })
          .setTimestamp()

        await interaction.reply({ embeds: [embed] })
        console.log("✅ Hadiah berhasil dikirim.")
      })
    } catch (error) {
      console.error("❌ Terjadi kesalahan saat menjalankan prosedur:", error)
      if (!interaction.replied) {
        await interaction.reply({
          content: "Terjadi kesalahan saat menjalankan perintah. Pastikan data sudah benar.",
          ephemeral: true,
        })
      }
    }
  },
}
