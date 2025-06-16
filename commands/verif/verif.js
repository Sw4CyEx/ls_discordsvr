const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const { dbConfig } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verif")
    .setDescription("Verifikasi menggunakan username dan password"),

  async execute(interaction) {
    try {
      const button = new ButtonBuilder()
        .setCustomId("start_verification")
        .setLabel("Mulai Verifikasi")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        content: "Klik tombol di bawah untuk memulai verifikasi!",
        components: [row],
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error saat menampilkan tombol verifikasi:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Terjadi kesalahan.", ephemeral: true });
      }
    }
  },

  async button(interaction) {
    if (interaction.customId !== "start_verification") return;

    try {
      const modal = new ModalBuilder()
        .setCustomId("verif_modal")
        .setTitle("Verifikasi Akun Elaim Saga");

      const usernameInput = new TextInputBuilder()
        .setCustomId("username")
        .setLabel("Masukkan Username Anda")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const passwordInput = new TextInputBuilder()
        .setCustomId("password")
        .setLabel("Masukkan Password Anda")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(usernameInput),
        new ActionRowBuilder().addComponents(passwordInput),
      );

      await interaction.showModal(modal);
    } catch (err) {
      console.error("Error saat membuat modal:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Terjadi kesalahan saat menampilkan form.", ephemeral: true });
      }
    }
  },

  async modal(interaction) {
    if (interaction.customId !== "verif_modal") return;

    const username = interaction.fields.getTextInputValue("username");
    const password = interaction.fields.getTextInputValue("password");

    try {
      const allowedUsers = process.env.ALLOWED_GUILDS?.split(",") || [];
      if (!allowedUsers.includes(interaction.guildId)) {
        return await interaction.reply({
          content: "Perintah ini hanya dapat digunakan di server yang diizinkan.",
          ephemeral: true,
        });
      }

      //console.log("DB CONFIG:", dbConfig);
      const pool = await sql.connect(dbConfig);
      console.log("🔍 Mencari user berdasarkan username...");
      const result = await pool.request()
        .input("username", sql.VarChar, username)
        .query("SELECT * FROM userMemberDB WHERE userID = @username");

      if (result.recordset.length === 0) {
        return interaction.reply({ content: "Username atau password salah.", ephemeral: true });
      }

      const user = result.recordset[0];
      const passwordMatch = await bcrypt.compare(password, user.userPWD);
      if (!passwordMatch) {
        return interaction.reply({ content: "Username atau password salah.", ephemeral: true });
      }

      const discordName = interaction.user.username;
      const discordIDX = interaction.user.id;

      const duplicateCheck = await pool.request()
        .input("discordIDX", sql.VarChar, discordIDX)
        .query("SELECT * FROM userMemberDB WHERE discordIDX = @discordIDX");

      if (duplicateCheck.recordset.length > 0) {
        return interaction.reply({
          content: `Akun Discord "${discordName}" sudah pernah diverifikasi.`,
          ephemeral: true,
        });
      }

      await pool.request()
        .input("discordName", sql.VarChar, discordName)
        .input("discordIDX", sql.VarChar, discordIDX)
        .input("Verified", sql.Int, 1)
        .input("username", sql.VarChar, username)
        .query(`
          UPDATE userMemberDB
          SET DiscordName = @discordName,
              discordIDX = @discordIDX,
              verified = @Verified
          WHERE userID = @username
        `);

      const role = interaction.guild.roles.cache.find(r => r.name === "Verified Lumi");
      if (!role) {
        return interaction.reply({ content: 'Role "Verified Lumi" tidak ditemukan.', ephemeral: true });
      }

      const member = await interaction.guild.members.fetch(discordIDX);
      await member.roles.add(role);

      await interaction.reply({
        content: "✅ Verifikasi berhasil! Role telah diberikan.",
        ephemeral: true,
      });
    } catch (error) {
    console.error("Verifikasi Error (modal):", error); // ✅ Log error detail ke console
    if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
        content: "❌ Terjadi kesalahan saat proses verifikasi. Silakan hubungi admin.",
        ephemeral: true,
        });
    }
    }

  },
};
