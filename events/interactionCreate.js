const { Events } = require("discord.js");
const { dbConfig } = require("../utils/database");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        if (interaction.commandName === 'giveaway') {
          await command.execute(interaction, client, dbConfig);
        } else {
          await command.execute(interaction, client);
        }
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Terjadi kesalahan saat menjalankan perintah.",
            ephemeral: true,
          });
        } else if (interaction.deferred) {
          await interaction.editReply({
            content: "❌ Terjadi kesalahan saat menjalankan perintah.",
          });
        }
      }
    }

    // Button: verif
    if (interaction.isButton()) {
      const command = client.commands.get('verif');
      if (command?.button) {
        await command.button(interaction, client);
      }
    }

    // Button: aktifdailydiscord
    if (interaction.isButton()) {
      const command = client.commands.get('aktifdailydiscord');
      if (command?.button) {
        await command.button(interaction, client);
      }
    }

    // Button: dailyboost
    if (interaction.isButton()) {
      const command = client.commands.get('dailyboost');
      if (command?.button) {
        await command.button(interaction, client);
      }
    }

    // Modal
    if (interaction.isModalSubmit()) {
      const command = client.commands.get('verif');
      if (command?.modal) {
        await command.modal(interaction, client);
      }
    }
  }
};
