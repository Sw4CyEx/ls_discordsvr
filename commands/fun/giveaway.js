const { SlashCommandBuilder } = require("@discordjs/builders")
const sql = require("mssql")
const { withDatabase, dbConfig } = require("../../utils/database");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Mulai giveaway di channel tertentu!")
    .addChannelOption(option =>
        option.setName("channel")
        .setDescription("Channel tempat giveaway akan berlangsung.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("duration")
        .setDescription("Durasi giveaway dalam menit.")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("reward")
        .setDescription("Deskripsi hadiah.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("type_item")
        .setDescription("Tipe hadiah.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("code_item")
        .setDescription("Kode item.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("quantity")
        .setDescription("Jumlah hadiah.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("winners")
        .setDescription("Jumlah pemenang.")
        .setRequired(true)
    ),
    async execute(interaction, client, dbConfig) {
    const sql = require("mssql");

    const allowedUsers = process.env.ALLOWED_USERS.split(',');
    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({
        content: 'Anda tidak memiliki izin untuk memulai giveaway.',
        ephemeral: true,
      });
    }

    const duration = interaction.options.getInteger('duration');
    const reward = interaction.options.getString('reward');
    const typeItem = interaction.options.getInteger('type_item');
    const codeItem = interaction.options.getInteger('code_item');
    const qty = interaction.options.getInteger('quantity');
    const winnersCount = interaction.options.getInteger('winners');
    const giveawayChannel = interaction.options.getChannel('channel');

    if (duration <= 0 || winnersCount <= 0) {
      return interaction.reply({
        content: 'Durasi dan jumlah pemenang harus lebih dari 0.',
        ephemeral: true,
      });
    }

    // Kirim pesan giveaway
    const giveawayEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎉 Giveaway Dimulai! 🎉')
      .setDescription(`Hadiah: **${reward}**\nKlik 🎉 untuk ikut serta!\nJumlah Pemenang: **${winnersCount}**`)
      .setImage('https://isekaiupload.cloud/uploads/20250521.png')
      .setFooter({ text: `Berakhir dalam ${duration} menit.` })
      .setTimestamp();

    const giveawayMessage = await giveawayChannel.send({
      content: '<@&1374296384332894239>',
      embeds: [giveawayEmbed]
    });

    await giveawayMessage.react('🎉');

    // Update waktu embed setiap menit
    const interval = setInterval(async () => {
      const timeLeft = duration - Math.floor((Date.now() - giveawayMessage.createdTimestamp) / 60000);
      if (timeLeft > 0) {
        giveawayEmbed.setFooter({ text: `Berakhir dalam ${timeLeft} menit.` });
        await giveawayMessage.edit({ embeds: [giveawayEmbed] });
      }
    }, 60000);

    setTimeout(async () => {
      clearInterval(interval);

      const fetchedMessage = await giveawayChannel.messages.fetch(giveawayMessage.id);
      const reactions = fetchedMessage.reactions.cache.get('🎉');
      if (!reactions) return giveawayChannel.send('Tidak ada peserta dalam giveaway ini.');

      const users = await reactions.users.fetch();
      const participants = users.filter((user) => !user.bot);
      if (participants.size === 0) return giveawayChannel.send('Tidak ada peserta dalam giveaway ini.');

      const winners = participants.random(winnersCount);
      const winnerMentions = winners.map(user => `<@${user.id}>`).join(', ');

      const winnerEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎉 Giveaway Berakhir! 🎉')
        .setDescription(`Selamat kepada ${winnerMentions} yang memenangkan hadiah: **${reward}**!`)
        .setTimestamp();

      await giveawayChannel.send({ embeds: [winnerEmbed] });
      giveawayChannel.send(`Hadiah telah dikirim ke akun ingame: ${winnerMentions} oleh <@1374304636961296384>`);

      // Kirim hadiah ke database
      const sendNick = 'DeveloperK';
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() + 3);

      try {
        const pool = await sql.connect(dbConfig);
        for (const winner of winners) {
          const playerNick = winner.username;
          await pool.request()
            .input('sendNick', sql.VarChar, sendNick)
            .input('receiveNick', sql.VarChar, playerNick)
            .input('persentType', sql.SmallInt, typeItem)
            .input('value1', sql.Int, codeItem)
            .input('value2', sql.Int, qty)
            .input('value3', sql.Int, 0)
            .input('value4', sql.Int, 0)
            .input('msgType', sql.Int, 202)
            .input('flag', sql.Int, 0)
            .input('limitDate', sql.DateTime, limitDate.toISOString())
            .execute('elaim_saga_giveaway_add');
        }
      } catch (error) {
        console.error('DB Error:', error);
        giveawayChannel.send('Terjadi kesalahan saat memberikan hadiah ke pemenang.');
      }
    }, duration * 60000);
  }
};