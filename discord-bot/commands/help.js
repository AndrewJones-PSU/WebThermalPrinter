const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("help").setDescription("Prints information about available commands"),
	async execute(interaction) {
		await interaction.reply({
			content:
				"/help - Prints information about available commands\n" +
				"/preview (NON FUNCTIONAL ATM) - Prints a preview of the message and/or files to the printer\n" +
				"/print - Prints a message and/or files to the printer\n\n" +
				"Some formatting tips:\n" +
				"Markdown is supported for the message and text file contents!\n" +
				"Refer to this guide for more information: https://www.markdownguide.org/basic-syntax/\n\n" +
				"Pro-tip: If you want to send an image, but only have the link, you can use the following syntax in your message:\n" +
				`\`![alt text](IMAGE URL)\`\n` +
				"Replace the IMAGE URL with the link to the image you want to send.",
			ephemeral: true,
		});
	},
};
