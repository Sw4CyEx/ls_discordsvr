const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const sql = require("mssql");
const axios = require("axios");
const { dbConfig } = require("../../utils/database");
const { hadiahListBoost } = require("../../utils/constants");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dailyboost")
    .setDescription("Tampilkan Tombol Daily untuk booster."),

  async execute(interaction) {
    const allowedUsers = process.env.ALLOWED_USERS.split(',');
    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({
        content: '❌ Hanya Incess yang bisa menggunakan perintah ini!',
        ephemeral: true,
      });
    }

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("daily-claim-booster")
        .setLabel("Klaim Hadiah Harian")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎁")
    );

    await interaction.reply({
      content: '**🎉 KLAIM HADIAH HARIAN DISCORD 🎉**\nKlik tombol di bawah untuk klaim hadiah harianmu!\nKhusus Role <@&1337827618141245530> Atau Booster Server!',
      components: [button],
    });
  },

  async button(interaction) {
    if (interaction.customId !== "daily-claim-booster") return;

    await interaction.deferReply({ ephemeral: true });

    const verifiedRoles = process.env.BoostRole.split(','); // Ambil daftar role yang diizinkan dari environment variable
    const hasVerifiedRole = interaction.member.roles.cache.some(role => verifiedRoles.includes(role.id));

    if (!hasVerifiedRole) {
        return await interaction.editReply({
            content: '❌ Hanya pengguna dengan role <@&1337827618141245530> yang bisa Mengklaim Reward Harian!'
        }).catch(console.error);
    }

    const DiscordName = interaction.user.username;
    const DiscordID = interaction.user.id;
    const date = new Date().toISOString().split("T")[0];

    try {
      const pool = await sql.connect(dbConfig);

      const checkResult = await pool.request()
        .input("DiscordID", sql.VarChar, DiscordID)
        .input("date", sql.Date, date)
        .query(`
          SELECT * FROM Ruby_Discord_Daily_Boost
          WHERE DiscordID = @DiscordID AND date = @date
        `);

      if (checkResult.recordset.length > 0) {
        return interaction.editReply({ content: "⏰ Kamu sudah klaim hadiah hari ini!" });
      }

      const hadiahKeys = Object.keys(hadiahListBoost);
      const randomKey = hadiahKeys[Math.floor(Math.random() * hadiahKeys.length)];
      const hadiahText = hadiahListBoost[randomKey];
      const jumlahAcak = Math.floor(Math.random() * 3) + 1;

      await pool.request()
        .input("sendNick", sql.VarChar, "DeveloperK")
        .input("receiveNick", sql.VarChar, DiscordName)
        .input("persentType", sql.Int, 3)
        .input("value1", sql.VarChar, randomKey)
        .input("value2", sql.Int, jumlahAcak)
        .input("value3", sql.Int, 0)
        .input("value4", sql.Int, 0)
        .input("msgType", sql.Int, 202)
        .input("flag", sql.Int, 0)
        .input("limitDate", sql.DateTime, new Date(Date.now() + 3 * 86400000))
        .execute("elaim_saga_giveaway_add");

      await pool.request()
        .input("DiscordName", sql.VarChar, DiscordName)
        .input("DiscordID", sql.VarChar, DiscordID)
        .input("tipehadiah", sql.Int, 3)
        .input("kodehadiah", sql.VarChar, randomKey)
        .input("randomJumlah", sql.Int, jumlahAcak)
        .input("date", sql.Date, date)
        .query(`
          INSERT INTO Ruby_Discord_Daily_Boost (EtcType, EtcCode, EtcQty, date, DiscordName, DiscordID)
          VALUES (@tipehadiah, @kodehadiah, @randomJumlah, @date, @DiscordName, @DiscordID)
        `);

      await axios.post(process.env.WEBHOOK_URL, {
        content: `🎁 **<@${interaction.user.id}>** berhasil klaim ${hadiahText} x${jumlahAcak}`
      });

      console.log(interaction.user.tag, `mendapatkan ${hadiahText} x${jumlahAcak} dari Boost Server!`);

      await interaction.editReply({
        content: `🎉 Berhasil! Kamu mendapatkan ${hadiahText} sebanyak ${jumlahAcak} buah!`
      });

    } catch (error) {
      console.error("[DAILY CLAIM ERROR]", error);
      await interaction.editReply({
        content: "❌ Gagal memproses hadiah, silakan coba lagi atau hubungi admin!"
      });
    }
  }
};
