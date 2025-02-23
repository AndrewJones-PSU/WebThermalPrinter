const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
const { handleWebServerInteraction } = require("../src/sendReq");

module.exports = {
	data: new ContextMenuCommandBuilder().setName("Print Message").setType(ApplicationCommandType.Message),

	async execute(interaction) {
		handleWebServerInteraction(interaction);
	},
};
