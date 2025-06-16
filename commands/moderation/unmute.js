const { SlashCommandBuilder } = require("@discordjs/builders")
const { PermissionsBitField } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Menghapus role Muted pada pengguna.")
    .addUserOption((option) =>
      option.setName("target").setDescription("Pengguna yang akan diunmute").setRequired(true),
    ),

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
        content: "Anda tidak memiliki izin untuk menggunakan unmute.",
        ephemeral: true,
      })
    }

    const member = interaction.options.getMember("target")
    if (!member) return interaction.reply("Pengguna tidak ditemukan!")

    try {
      // Get Muted role
      const mutedRole = interaction.guild.roles.cache.find((role) => role.name === "Muted")
      if (!mutedRole) {
        return interaction.reply("Role Muted tidak ditemukan di server ini.")
      }

      // Check if member has Muted role
      if (member.roles.cache.has(mutedRole.id)) {
        await member.roles.remove(mutedRole)
        await interaction.reply(`${member.user.tag} telah diunmute.`)
      } else {
        await interaction.reply(`${member.user.tag} tidak sedang dimute.`)
      }
    } catch (error) {
      console.error("Gagal unmute:", error)
      interaction.reply("Terjadi kesalahan saat mencoba unmute pengguna.")
    }
  },
}
