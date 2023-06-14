const { SlashCommandBuilder } = require("discord.js");
const sendReq = require("./../src/sendReq.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("print")
		.setDescription("Prints a message and/or files to the printer")
		.addStringOption((option) => option.setName("message").setDescription("Message to print").setRequired(false))
		.addAttachmentOption((option) =>
			option
				.setName("file")
				.setDescription("File to print, accepts .png .jpeg .txt and .md files")
				.setRequired(false)
		),

	async execute(interaction) {
		sendReq.sendRequestToWebServer(interaction, "print");
	},
};
