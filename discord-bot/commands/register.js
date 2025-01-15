// This is not a command, but a function that registers slash commands to the Discord API.
// This is NOT run when building the image, and needs to be manually run.
const fs = require("fs");
const path = require("path");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
require('dotenv').config();

// check that .env and variables exist
if (process.env.discordBotToken === undefined) {
	console.error("discordBotToken is undefined, make sure you have a .env in the commands directory and discordBotToken is defined")
	console.log("If .env doesn't exist yet, make sure to also add DiscordBotID to it")
	process.exit(1)
}
if (process.env.discordBotID === undefined) {
	console.error("discordBotID is undefined, define it in your .env in the commands directory")
	process.exit(1)
}


const commands = [];
const commandsPath = path.join(__dirname, "/");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js") && file !== "register.js" && file !== "registerdev.js");

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

console.log(commands);

const rest = new REST({ version: "10" }).setToken(process.env.discordBotToken);

Routes.applicationCommands;

rest.put(Routes.applicationCommands(process.env.discordBotID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);
