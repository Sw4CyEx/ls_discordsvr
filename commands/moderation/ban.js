const { SlashCommandBuilder } = require("@discordjs/builders")
const { PermissionsBitField } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Memban pengguna dari server.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna yang akan diban").setRequired(true)),

  async execute(interaction, client) {
    // Check if command is used in a guild
    if (!interaction.guild) {
      return interaction.reply({
        content: "Perintah ini hanya dapat digunakan di dalam server, bukan di DM atau pesan pribadi.",
        ephemeral: true,
      })
    }

    // Check permissions
    const allowedAdminOnly = process.env.ALLOWED_ADMIN_ONLY === "true"
    if (allowedAdminOnly && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "Anda tidak memiliki izin untuk menggunakan ban.",
        ephemeral: true,
      })
    }

    const member = interaction.options.getMember("target")
    if (!member) return interaction.reply("Pengguna tidak ditemukan!")
    if (member.user.id === interaction.user.id) return interaction.reply("Anda tidak bisa memban diri sendiri!")

    try {
      await member.ban()
      await interaction.reply(`${member.user.tag} telah diban!`)
    } catch (error) {
      console.error("Gagal ban:", error)
      interaction.reply("Terjadi kesalahan saat mencoba memban pengguna.")
    }
  },
}
