const { SlashCommandBuilder } = require("@discordjs/builders")
const { PermissionsBitField } = require("discord.js")
const { hasPermission } = require("../../utils/permissions")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Meng-kick pengguna dari server.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna yang akan dikick").setRequired(true)),

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
        content: "Anda tidak memiliki izin untuk menggunakan kick.",
        ephemeral: true,
      })
    }

    const member = interaction.options.getMember("target")
    if (!member) return interaction.reply("Pengguna tidak ditemukan!")
    if (member.user.id === interaction.user.id) return interaction.reply("Anda tidak bisa meng-kick diri sendiri!")

    try {
      await member.kick()
      await interaction.reply(`${member.user.tag} telah dikick!`)
    } catch (error) {
      console.error("Gagal kick:", error)
      interaction.reply("Terjadi kesalahan saat mencoba meng-kick pengguna.")
    }
  },
}
