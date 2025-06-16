const { SlashCommandBuilder } = require("@discordjs/builders")
const { withDatabase, dbConfig } = require("../../utils/database");

const sql = require("mssql")

module.exports = {
  data: new SlashCommandBuilder().setName("koleksi").setDescription("Lihat koleksi karaktermu!"),

  async execute(interaction, client) {
    const user = interaction.user

    try {
      await withDatabase(dbConfig, async (pool) => {
        const result = await pool
          .request()
          .input("userId", sql.VarChar, user.username)
          .query(`
            SELECT c.id, c.name, c.rarity, c.image_url 
            FROM UserCharacters uc 
            JOIN Characters c ON uc.character_id = c.id 
            WHERE uc.user_id = @userId
          `)

        if (result.recordset.length > 0) {
          let response = "📜 **Koleksi Karakter Kamu:**\n"
          result.recordset.forEach((char) => {
            response += `- **${char.name}** (Rarity: ${char.rarity}, ID: ${char.id})\n`
          })
          await interaction.reply(response)
        } else {
          await interaction.reply("📭 Kamu belum memiliki karakter! Coba gacha dulu dengan `/gacha`.")
        }
      })
    } catch (err) {
      console.error(err)
      await interaction.reply("❌ Terjadi kesalahan saat mengambil koleksi!")
    }
  },
}
