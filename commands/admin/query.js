const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { withDatabase } = require("../../utils/database")
const { hasPermission } = require("../../utils/permissions")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("query")
    .setDescription("Menjalankan SQL query di database.")
    .addStringOption((option) => option.setName("sql").setDescription("SQL query untuk dijalankan").setRequired(true)),

  async execute(interaction, client) {
    // Check permissions
    if (!hasPermission(interaction.user.id, "ALLOWED_USERS")) {
      return interaction.reply({
        content: "Hanya owner yang bisa mengakses perintah SQL.",
        ephemeral: true,
      })
    }

    const query = interaction.options.getString("sql")

    try {
      await withDatabase(client.dbConfig, async (pool) => {
        // Execute SQL query
        const result = await pool.request().query(query)

        // Prepare results for display
        const rows = result.recordset.slice(0, 5) // Take only first 5 results
        const fields = Object.keys(rows[0] || []).join(", ")
        const tableData = rows.map((row) => Object.values(row).join(", ")).join("\n")

        const embed = new EmbedBuilder()
          .setColor(0x00bfff)
          .setTitle("Hasil Query")
          .setDescription("```" + `Kolom:\n${fields}\n\n` + `Baris:\n${tableData}` + "```")
          .setFooter({ text: "Menampilkan 5 hasil pertama." })
          .setTimestamp()

        await interaction.reply({ embeds: [embed] })
      })
    } catch (error) {
      console.error("Terjadi kesalahan saat menjalankan query:", error)
      interaction.reply({
        content: "Terjadi kesalahan saat menjalankan query. Pastikan query valid.",
        ephemeral: true,
      })
    }
  },
}
