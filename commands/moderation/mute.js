const { SlashCommandBuilder } = require("@discordjs/builders")
const { PermissionsBitField } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Memberikan role Muted kepada pengguna untuk menonaktifkan komunikasi.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna yang akan dimute").setRequired(true))
    .addIntegerOption((option) =>
      option.setName("duration").setDescription("Durasi mute dalam menit").setRequired(true),
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
        content: "Anda tidak memiliki izin untuk menggunakan mute.",
        ephemeral: true,
      })
    }

    const member = interaction.options.getMember("target")
    if (!member) return interaction.reply("Pengguna tidak ditemukan!")
    if (member.user.id === interaction.user.id) return interaction.reply("Anda tidak bisa mute diri sendiri!")

    const muteDuration = interaction.options.getInteger("duration")
    if (!muteDuration || muteDuration <= 0) {
      return interaction.reply("Durasi mute tidak valid. Harap masukkan durasi dalam menit.")
    }

    try {
      // Get or create Muted role
      let mutedRole = interaction.guild.roles.cache.find((role) => role.name === "Muted")
      if (!mutedRole) {
        mutedRole = await interaction.guild.roles.create({
          name: "Muted",
          color: "#555555",
          permissions: [],
        })

        // Add permission overwrites for Muted role in all channels
        for (const [, channel] of interaction.guild.channels.cache) {
          await channel.permissionOverwrites.create(mutedRole, {
            SEND_MESSAGES: false,
            SPEAK: false,
            ADD_REACTIONS: false,
          })
        }
      }

      // Add Muted role to member
      await member.roles.add(mutedRole)
      await interaction.reply(`${member.user.tag} telah dimute selama ${muteDuration} menit.`)

      // Set timeout to remove Muted role after duration
      const muteDurationMs = muteDuration * 60 * 1000
      setTimeout(async () => {
        if (member.roles.cache.has(mutedRole.id)) {
          await member.roles.remove(mutedRole)
          await interaction.followUp({
            content: `${member.user.tag} telah diunmute setelah ${muteDuration} menit.`,
            ephemeral: true,
          })
        }
      }, muteDurationMs)
    } catch (error) {
      console.error("Gagal mute:", error)
      interaction.reply("Terjadi kesalahan saat mencoba mute pengguna.")
    }
  },
}
