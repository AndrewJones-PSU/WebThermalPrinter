const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("help").setDescription("Prints information about available commands"),
	async execute(interaction) {
		await interaction.reply({
			content:
				"/help - Displays information about available commands\n" +
				"/preview - Displays a preview of the message and/or files\n" +
				"/print - Prints a message and/or files to the printer\n" +
				"You can also print another user's message by right-clicking it and selecting Apps > Print Message\n\n" +
				"**Some formatting tips:**\n" +
				"- Markdown is supported for the message and text file contents!\n" +
				"Refer to this guide for more information: https://www.markdownguide.org/basic-syntax/\n\n" +
				"- If you want to send an image, but only have the link, you can use the following syntax in your message:\n" +
				`\`![alt text](IMAGE URL)\`\n` +
				"Replace the IMAGE URL with the link to the image you want to send.\n" +
				"-# Note this doesn't work perfectly with discord links because of how discord restricts using their links outside of their application, so these images might not print unfortunately.\n\n" +
				"- To add a newline in your message, append '\\n' where you want the newline to be.",
			ephemeral: false,
		});
	},
};
