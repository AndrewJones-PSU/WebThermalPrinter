// check if dev environment, if so, import config.json and env.json from parent directory
// (in production, these files are imported by the build script, but in development,
// we want to be able to edit them without having to copy the file to
// every subdirectory that needs it).

if (process.env.NODE_ENV !== "production") {
	const fs = require("fs");
	console.warn("Dev environment detected, copying configs from parent directory.");
	console.warn(
		"Since environment variables are loaded before this script runs, you may need to restart this process for changes to take effect."
	);
	fs.copyFileSync("./../config.json", "./config.json");
	fs.copyFileSync("./../.env", "./.env");
}

// Define the rest of our imports
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// Create the client and import commands
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js") && file !== "register.js" && file !== "registerdev.js");

// Dynamically import commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Display a message when the bot is ready
client.once("ready", () => {
	client.user;
	client.user.setActivity("some activity", { type: "WATCHING" });
	console.log("Ready!");
});

// Handle slash commands whenever they are used
client.on("interactionCreate", async (interaction) => {
	// check if the interaction is a command. If not, ignore it.
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	// try to execute the command. If it fails, send an error message.
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		try {
			await interaction.reply({
				content: `There was an error while executing this command!\n\n${error}`,
				ephemeral: true,
			});
		} catch (newerror) {
			await interaction.editReply({
				content: `There was an error while executing this command!\n\n${error}`,
				ephemeral: true,
			});
		}
	}
});

// if there's any errors, log it
client.on("error", (error) => {
	console.error(error);
});

// log the bot in
client.login(process.env.discordBotToken);
