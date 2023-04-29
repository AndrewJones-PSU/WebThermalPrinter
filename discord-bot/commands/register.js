// This is not a command, but a function that registers slash commands to the Discord API.
const fs = require("fs");
const path = require("path");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const env = require("./../env.json");

const commands = [];
const commandsPath = "./";
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js") && file !== "register.js");

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

console.log(commands);

const rest = new REST({ version: "10" }).setToken(env.BOT_TOKEN);

Routes.applicationCommands;

rest.put(Routes.applicationGuildCommands(env.BOT_ID, env.DEV_GUILD_ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);
