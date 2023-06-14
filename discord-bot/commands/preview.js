const { SlashCommandBuilder } = require("discord.js");
const sendReq = require("./../src/sendReq.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("preview")
		.setDescription("Previews a message and/or file without printing it")
		.addStringOption((option) => option.setName("message").setDescription("Message to preview").setRequired(false))
		.addAttachmentOption((option) =>
			option
				.setName("file")
				.setDescription("File to preview, accepts .png .jpeg .txt and .md files")
				.setRequired(false)
		),

	async execute(interaction) {
		sendReq.sendRequestToWebServer(interaction, "preview");
	},
};
