require("dotenv").config()
const { Client, GatewayIntentBits, Collection } = require("discord.js")
const fs = require("fs")
const path = require("path")
const sql = require("mssql")
const EventEmitter = require("events")

// Increase event listener limit
EventEmitter.defaultMaxListeners = 35

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
})

// Database configuration
const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER.split(":")[0],
  port: Number.parseInt(process.env.SQL_SERVER.split(":")[1], 10),
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
    enableArithAbort: true,
    requestTimeout: 30000,
  },
}

// Store commands and cooldowns
client.commands = new Collection()
client.cooldowns = new Map()
client.gachaLimits = new Map()

// Load commands
const commandFolders = fs.readdirSync(path.join(__dirname, "commands"))
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter((file) => file.endsWith(".js"))

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", folder, file))
    if (command.data) {
      client.commands.set(command.data.name, command)
    }
  }
}

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, "events")).filter((file) => file.endsWith(".js"))

for (const file of eventFiles) {
  const event = require(path.join(__dirname, "events", file))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client))
  } else {
    client.on(event.name, (...args) => event.execute(...args, client))
  }
}

// Make database config available to all commands
client.dbConfig = dbConfig

// Login to Discord
client.login(process.env.DISCORD_TOKEN)

// Handle process errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error)
})
