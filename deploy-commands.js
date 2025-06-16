require("dotenv").config()
const { REST, Routes } = require("discord.js")
const fs = require("fs")
const path = require("path")

const commands = []
const commandFolders = fs.readdirSync(path.join(__dirname, "commands"))

// Load all command data
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter((file) => file.endsWith(".js"))

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", folder, file))
    if (command.data) {
      commands.push(command.data.toJSON())
    }
  }
}

// Deploy commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)
;(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // The put method is used to fully refresh all commands
    const data = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands })

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error(error)
  }
})()
