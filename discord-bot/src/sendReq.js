const http = require("http");
const https = require("https");
const formdata = require("form-data");
const discord = require("discord.js");
require("dotenv").config();

async function sendRequestToWebServer(interaction, requestType) {
	// sanity check that the request type is valid
	if (requestType !== "preview" && requestType !== "print")
		throw new Error("Invalid request type, must be preview or print, got " + requestType);

	await interaction.deferReply({ ephemeral: true });
	const message = interaction.options.getString("message");
	const file = interaction.options.getAttachment("file");
	// sanity check that the user didn't send either option
	if (!message && !file) {
		await interaction.editReply({
			content: "No content provided, you must provide a message and/or file to " + requestType,
			ephemeral: true,
		});
		return;
	}

	// take the message and/or file, and send it to the web server
	let form = new formdata();

	// append username, then go through and replace all instances of \n with a newline character
	let sendmessage = `${getTimeFromStamp(interaction.createdTimestamp)} - ${interaction.user.tag}:\n\n`;
	if (message) sendmessage += message.replace(/\\n/g, "\n\n");
	form.append("allfiles", Buffer.from(sendmessage), {
		filename: "message.txt",
		contentType: "text/plain",
	});
	// if file, append it to the form

	if (file) {
		// get the file mimetype
		let contentType = file.contentType;
		// if the file is not a png, jpeg, txt, or md file, throw an error
		if (
			!["image/png", "image/jpeg", "text/plain; charset=utf-8", "text/markdown; charset=utf-8"].includes(
				contentType
			)
		) {
			await interaction.editReply({
				content: `Invalid file type, only .png .jpeg .txt and .md files are supported. Type sent: ${contentType}`,
				ephemeral: true,
			});
			return;
		}
		// download the file and append it to the form
		let src = file.url;
		// download the image
		https.get(src, (response) => {
			// check that we actually got a successful response
			if (response.statusCode < 200 || response.statusCode > 299) {
				response.resume();
				interaction.editReply({
					content: `Error: Image Download failed, status code: ${response.statusCode}`,
					ephemeral: true,
				});
				return;
			}
			// now that we know we got a successful response, download the file
			let chunks = [];
			response.on("data", (chunk) => {
				chunks.push(chunk);
			});
			response.on("end", () => {
				form.append("allfiles", Buffer.concat(chunks), {
					filename: file.name,
					contentType: contentType,
				});
				sendToWebServer(form, interaction, file, message, contentType, requestType);
			});
		});
	}
	// if we didn't download a file, send the form to the web server
	else {
		sendToWebServer(form, interaction, file, message, null, requestType);
		return;
	}
}

function sendToWebServer(form, interaction, file, message, contentType, requestType) {
	let request = http.request({
		method: "POST",
		host: process.env.webIP,
		path: "/" + requestType,
		port: process.env.webPort,
		headers: form.getHeaders(),
	});
	form.pipe(request);
	request.on("error", (res) => {
		interaction.editReply({
			content: `Error sending file to web server\n\n${res}`,
			ephemeral: true,
		});
		console.error(res);
	});
	request.on("response", (res) => {
		if (res.statusCode === 200) {
			interaction.deleteReply();
			if (requestType === "print") {
				let interactionmessage;
				if (file && message) {
					interactionmessage = `${interaction.user} Successfully printed a message and a ${contentType} file!`;
				} else if (file) {
					interactionmessage = `${interaction.user} Successfully printed a ${contentType} file!`;
				} else {
					interactionmessage = `${interaction.user} Successfully printed a message!`;
				}
				interaction.followUp({
					content: interactionmessage,
					ephemeral: false,
				});
			} else if (requestType === "preview") {
				// previews come back as base64 encoded images, each image seperated by a newline. Split the response by newline, then decode each image and send it to the user
				// get text
				let data = "";
				res.on("data", (d) => {
					data += d;
				});
				res.on("end", () => {
					let images = data.split("\n");
					// remove the last element, it's always empty
					images.pop();
					for (let i = 0; i < images.length; i++) {
						let buffer = Buffer.from(images[i].slice(22), "base64");
						interaction.followUp({
							files: [new discord.AttachmentBuilder(buffer, `preview${i}.png`)],
							ephemeral: true,
						});
					}
					interaction.followUp({
						content:
							"Here is your preview! If you are happy with it, you can print it by running `/print` with the same input files.",
						ephemeral: true,
					});
				});
			}
		} else {
			res.on("data", (data) => {
				if (requestType === "preview")
					interaction.editReply({
						content: `Error previewing file\n\n${data}`,
						ephemeral: true,
					});
				else if (requestType === "print")
					interaction.editReply({
						content: `Error printing file\n\n${data}`,
						ephemeral: true,
					});
			});
		}
	});
}

// returns the time in the format DD/MM/YYYY HH:MM:SS
function getTimeFromStamp(stamp) {
	let date = new Date(stamp);
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
	sendRequestToWebServer,
};
