const { REST, Routes } = require("discord.js")
const sql = require("mssql")
const { getRandomIdleMoodMessage } = require("../utils/memory");


module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Bot sudah online sebagai ${client.user.tag}!`)
    
    // const channelId = "1334411426122567760";
    // const channel = client.channels.cache.get(channelId);
    // if (channel) {
    //   setInterval(() => {
    //     const message = getRandomIdleMoodMessage();
    //     channel.send(message).catch(console.error);
    //   }, 10 * 60 * 1000);
    // }


    // Register slash commands
    try {
      console.log("Mendaftarkan slash commands...")
      const commands = Array.from(client.commands.values()).map((command) => command.data.toJSON())

      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)
      await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands })

      console.log("Slash commands terdaftar!")
    } catch (error) {
      console.error("Gagal mendaftarkan commands:", error)
    }

    // Start auto-execute procedures
    startAutoExecute(client)

    // Update activity status
    updateActivity(client)
    setInterval(() => updateActivity(client), 30000)
  },
}

// Function to auto-execute procedures
async function startAutoExecute(client) {
  console.log("Auto-update prosedur dimulai.")
  setInterval(
    async () => {
      console.log("Menjalankan prosedur...")
      try {
        const results = await executeProcedures(client.dbConfig)
        await sendNotification(client, results)
      } catch (error) {
        console.error("Terjadi kesalahan saat auto-update:", error)
      }
    },
    10 * 60 * 6000, // 10 minutes in milliseconds
  )
}

// Function to execute procedures
async function executeProcedures(dbConfig) {
  try {
    const pool = await sql.connect(dbConfig)
    const results = []

    // Execute first procedure
    await pool.request().query("EXEC AGENT_RANKING_LADDER_DAILY")
    results.push("✅ Ranking Ladder Berhasil di diperbarui oleh Lumi.")

    // Execute second procedure
    await pool.request().query("EXEC AGENT_RANKING_LADDER_DAILYB")
    results.push("✅ Ranking Battle Berhasil di diperbarui oleh Lumi.")

    // Execute third procedure
    await pool.request().query("EXEC AGENT_RANKING_LADDER_TITLE")
    results.push("✅ Ranking Fwar Berhasil di diperbarui oleh Lumi.")

    return results
  } catch (error) {
    console.error("Gagal menjalankan prosedur:", error)
    throw new Error("Terjadi kesalahan saat mengeksekusi prosedur.")
  }
}

// Function to send notification to Discord channel
async function sendNotification(client, results) {
  const channelId = process.env.NOTIFICATION_CHANNEL_ID
  const messageId = process.env.NOTIFICATION_MESSAGE_ID

  const channel = client.channels.cache.get(channelId)
  if (!channel) {
    console.error(`Channel dengan ID ${channelId} tidak ditemukan.`)
    return
  }

  const { EmbedBuilder } = require("discord.js")
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("🔥 Auto Update Ladder/F-War Ranking 🔥")
    .setDescription(results.join("\n"))
    .setFooter({ text: "Auto Update ini dijalankan setiap 60 menit." })
    .setTimestamp()

  try {
    if (messageId) {
      // If message already exists, edit it
      const message = await channel.messages.fetch(messageId)
      await message.edit({ embeds: [embed] })
      console.log("Notifikasi berhasil diperbarui.")
    } else {
      // If no message exists, send a new one
      const newMessage = await channel.send({ embeds: [embed] })
      process.env.NOTIFICATION_MESSAGE_ID = newMessage.id
      console.log("Notifikasi berhasil dikirim.")
    }
  } catch (error) {
    console.error("Gagal memperbarui notifikasi di channel:", error)
  }
}

// Function to update activity status
function updateActivity(client) {
  const userCount = client.users.cache.size
  const serverCount = client.guilds.cache.size

  try {
    client.user.setPresence({
      activities: [
        {
          name: `Rubies`,
          type: 3, // 3 = Playing
          state: `${serverCount} servers | ${userCount} users`,
          url: "https://elaim.lostsaga.moe",
        },
      ],
      status: "idle",
    })
  } catch (error) {
    console.error("Gagal mengatur aktivitas:", error)
  }
}
