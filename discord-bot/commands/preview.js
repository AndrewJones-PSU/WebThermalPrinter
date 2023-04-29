const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("preview")
		.setDescription("Previews a message and/or file without printing it"),
	async execute(interaction) {
		await interaction.reply({
			content: "TODO: Preview command",
			ephemeral: true,
		});
	},
};
