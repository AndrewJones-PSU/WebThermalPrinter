const { SlashCommandBuilder } = require("discord.js");
const http = require("http");
const https = require("https");
const formdata = require("form-data");
const env = require("./../env.json");

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
		const message = interaction.options.getString("message");
		const file = interaction.options.getAttachment("file");
		// sanity check that the user didn't send either option
		if (!message && !file) {
			await interaction.reply({
				content: "No content provided, you must provide a message and/or file to print",
				ephemeral: true,
			});
			return;
		}

		// take the message and/or file, and send it to the web server
		let form = new formdata();
		// if message, turn it into a text file buffer and append it to the form
		if (message) {
			form.append("allfiles", Buffer.from(message), {
				filename: "message.txt",
				contentType: "text/plain",
			});
		}
		// if file, append it to the form
		let request;
		if (file) {
			// get the file mimetype
			let contentType = file.contentType;
			// if the file is not a png, jpeg, txt, or md file, throw an error
			if (!["image/png", "image/jpeg", "text/plain", "text/markdown"].includes(contentType)) {
				await interaction.reply({
					content: "Invalid file type, only .png .jpeg .txt and .md files are supported",
					ephemeral: true,
				});
				return;
			}
			// download the file and append it to the form
			let url = file.url;
			// for now, just print out the URL

			form.append("allfiles", Buffer.from(url), {
				filename: "url.txt",
				contentType: "text/plain",
			});
			// request = https.request(url, (res) => {
			// 	let data = [];
			// 	res.on("data", (chunk) => {
			// 		data.push(chunk);
			// 	});
			// 	res.on("end", () => {
			// 		let buffer = Buffer.concat(data);
			// 		form.append("allfiles", buffer, {
			// 			filename: file.name,
			// 			contentType: contentType,
			// 		});
			// 	});
			// });
			// request.on("error", (err) => {
			// 	interaction.reply({
			// 		content: `Error downloading file\n\n${err}`,
			// 		ephemeral: true,
			// 	});
			// 	console.error(err);
			// });
		}

		// if we didn't download a file, send the form to the web server
		//		if (!file) {
		sendToWebServer(form, interaction);
		return;
		//		}

		// otherwise, after downloading the file, send the form to the web server
		request.on("close", () => {
			sendToWebServer(form, interaction);
			return;
		});
	},
};

function sendToWebServer(form, interaction) {
	let request = http.request({
		method: "POST",
		host: env.webIP,
		path: "/print",
		port: env.webPort,
		headers: form.getHeaders(),
	});
	form.pipe(request);
	request.on("error", (res) => {
		interaction.reply({
			content: `Error sending file to web server\n\n${res}`,
			ephemeral: true,
		});
		console.error(res);
	});
	request.on("response", (res) => {
		if (res.statusCode === 200) {
			interaction.reply({
				content: "Successfully printed!",
				ephemeral: false,
			});
		} else {
			res.on("data", (data) => {
				interaction.reply({
					content: `Error printing file\n\n${data}`,
					ephemeral: true,
				});
			});
		}
	});
}
