const { SlashCommandBuilder } = require("@discordjs/builders")
const { WebhookClient } = require("discord.js")
const { withDatabase } = require("../../utils/database")
const { hasPermission } = require("../../utils/permissions")
const sql = require("mssql")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hardlogout")
    .setDescription("Memaksa logout akun berdasarkan nickname.")
    .addStringOption((option) =>
      option.setName("nickname").setDescription("Nickname pengguna yang akan di-hard logout.").setRequired(true),
    ),

  async execute(interaction, client) {
    // Check permissions
    if (!hasPermission(interaction.user.id, "ALLOWED_MODERATOR")) {
      return interaction.reply({
        content: "Anda tidak memiliki izin untuk menggunakan perintah ini.",
        ephemeral: true,
      })
    }

    const nickname = interaction.options.getString("nickname")
    if (!nickname) {
      return interaction.reply({
        content: "Nickname tidak boleh kosong!",
        ephemeral: true,
      })
    }

    try {
      await withDatabase(client.dbConfig, async (pool) => {
        // Find user data by nickname
        const userQuery = await pool
          .request()
          .input("nickname", sql.VarChar, nickname)
          .query(`
            SELECT g.gameMoney, m.nickName, m.accountIDX, m.userID, m.session_id
            FROM userGameDB g
            INNER JOIN userMemberDB m ON g.accountIDX = m.accountIDX
            WHERE m.nickName = @nickname
          `)

        const userData = userQuery.recordset[0]

        if (!userData) {
          return interaction.reply({
            content: "Nickname tidak ditemukan!",
            ephemeral: true,
          })
        }

        const { nickName, accountIDX, session_id } = userData

        // Check if account is active
        if (!session_id) {
          return interaction.reply({
            content: "Akun ini tidak aktif di website.",
            ephemeral: true,
          })
        }

        // Perform hard logout by removing session_id
        const logoutQuery = await pool
          .request()
          .input("accountIDX", sql.Int, accountIDX)
          .query(`UPDATE userMemberDB SET session_id = NULL WHERE accountIDX = @accountIDX`)

        if (logoutQuery.rowsAffected[0] > 0) {
          const processedBy = `<@${interaction.user.id}>`

          // Create success message
          const successMessage = `
================================
[ Keterangan Hard Logout ] 
NickName : ${nickName}
Status   : Sudah dipaksa logout dari website
================================
Diproses oleh : ${processedBy}
================================
          `

          // Send message to Discord webhook
          const webhookURL = process.env.HARDLOGOUT_WEBHOOK_URL
          const webhookClient = new WebhookClient({ url: webhookURL })

          await webhookClient.send({
            content: successMessage,
          })

          // Reply to interaction with success
          return interaction.reply({
            content: successMessage,
            ephemeral: true,
          })
        } else {
          return interaction.reply({
            content: "Terjadi kesalahan saat mencoba melakukan hard logout.",
            ephemeral: true,
          })
        }
      })
    } catch (error) {
      console.error("Terjadi kesalahan:", error)
      interaction.reply({
        content: "Terjadi kesalahan saat memproses perintah ini.",
        ephemeral: true,
      })
    }
  },
}
