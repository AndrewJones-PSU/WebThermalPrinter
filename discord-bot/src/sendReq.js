const http = require("http");
const https = require("https");
const formdata = require("form-data");
const { PermissionsBitField, AttachmentBuilder, MessageFlags } = require("discord.js");


async function handleWebServerInteraction(interaction, print = true) {
	await interaction.reply({
		flags: MessageFlags.Ephemeral,
		content: "Processing Request...",
	});

	// OK here's what we have to do
	// First, check which kind of interaction we're dealing with
	//	there's three options for this rn, which are:
	//	- print /command
	//	- preview /command
	//	- message reply
	let message, attachments;
	let missingAttachments = false;
	const isContextMenu = interaction.isMessageContextMenuCommand();
	// if interaction is reply to a message...
	if (isContextMenu) {
		message = interaction.targetMessage.content;
		attachments = interaction.targetMessage.attachments.toJSON();
	} else {
		message = interaction.options.getString("message");
		attachments = [interaction.options.getAttachment("file")];
		// sanity check that the user didn't send either option
		if (!message && !attachments) {
			interaction.editReply("Error: No content provided, you must provide a message and/or file.");
			return;
		}
	}
	// Then, we get all the data/attachments for these
	//	remember that attachments have to be downloaded!
	let filenames = [];
	let filetypes = [];
	let urls = [];
	// Check that we can download all the attachments
	for (const attachment of attachments) {
		if (attachment === null) {
			// pass if no attachment
		}
		// if the file is not a png, jpeg, txt, or md file, throw an error
		else if (
			!["image/png", "image/jpeg", "text/plain; charset=utf-8", "text/markdown; charset=utf-8"].includes(
				attachment.contentType
			)
		) {
			if (isContextMenu) {
				// if from a context menu, don't stop the request but make a note of it
				missingAttachments = true;
			} else {
				// otherwise, yell at the user
				interaction.editReply(
					`Invalid file type, only .png .jpeg .txt and .md files are supported. Type sent: ${attachment.contentType}`
				);
				return;
			}
		} else {
			urls.push(attachment.url);
			filenames.push(attachment.name);
			filetypes.push(attachment.contentType);
		}
	}
	// Now download all attachments
	let files;
	try {
		files = await Promise.all(urls.map(getAttachment));
	} catch (error) {
		interaction.editReply(`Error: An attachment download failed, please try again.`);
		return;
	}
	// Create text portion, append timestamp and user(s) to top
	let sendmessage = `${getTimeFromStamp(interaction.createdTimestamp)} - ${interaction.user.tag}`;
	if (isContextMenu) sendmessage += `\\\noriginal message from ${interaction.targetMessage.author.tag}:\n\n`;
	else sendmessage += `:\n\n`;
	// append OG message, add an extra newlines to all newlines for markdown
	if (message) sendmessage += message.replace(/\\n/g, "\n\n");

	// Now we take our data and put it into a formdata
	let form = new formdata();
	form.append("allfiles", Buffer.from(sendmessage), {
		filename: "message.txt",
		contentType: "text/plain",
	});
	for (let i = 0; i < files.length; i++) {
		form.append("allfiles", files[i], {
			filename: filenames[i],
			contentType: filetypes[i],
		});
	}
	// Once we have our formdata, we send our request to the WTP web server
	interaction.editReply("Sending to printer...");
	let request = http.request({
		method: "POST",
		host: process.env.webIP,
		path: "/" + (print ? "print" : "preview"),
		port: global.parseInt(process.env.webPort),
		headers: form.getHeaders(),
	});

	form.pipe(request);
	request.on("error", (res) => {
		interaction.editReply({
			content: `Error: An error occured while communicating with the printer server.`,
			ephemeral: true,
		});
		console.error(res);
	});
	request.on("response", (res) => {
		if (res.statusCode === 200) {
			if (print) {
				// set response message appropriately
				let interactionmessage;
				if (isContextMenu) {
					interactionmessage = `${interaction.user} printed this message!`;
					if (missingAttachments)
						interactionmessage +=
							"\n-# note: some attachments were not accepted filetypes and were not printed.";
				} else if (files.length > 0 && message) {
					interactionmessage = `${interaction.user} Successfully printed a message and a ${filetypes[0]} file!`;
				} else if (files.length > 0) {
					interactionmessage = `${interaction.user} Successfully printed a ${filetypes[0]} file!`;
				} else {
					interactionmessage = `${interaction.user} Successfully printed a message!`;
				}

				// check that we can access the channel
				if (canAccessChannel(interaction)) {
					interaction.deleteReply();
					if (isContextMenu) interaction.targetMessage.reply(interactionmessage);
					else interaction.channel.send(interactionmessage);
				} else {
					interaction.editReply(interactionmessage);
				}
			} else {
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
							files: [new AttachmentBuilder(buffer, `preview${i}.png`)],
							ephemeral: true,
						});
					}
					interaction.editReply({
						content:
							"Here is your preview! If you are happy with it, you can print it by running `/print` with the same input files.",
						ephemeral: true,
					});
				});
			}
		} else {
			// handle non-200 status requests
			res.on("data", (data) => {
				if (res.statusCode >= 500) {
					interaction.editReply({
						content: `Error: An interal error occured in the print server.`,
						ephemeral: true,
					});
					console.error(res);
				} else {
					interaction.editReply({
						content: `Error: ${res.statusCode} response from print server:\n\n${data}`,
						ephemeral: true,
					});
				}
			});
		}
	});

	// Check the response, respond to the user's OG message in kind
}

function getAttachment(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			// check that we actually got a successful response
			if (response.statusCode < 200 || response.statusCode > 299) {
				console.warn(`Attachment download failed:\n${response}`);
				reject({
					content: `Error: Attachment download failed, status code: ${response.statusCode}`,
					response: response,
					statusCode: response.statusCode,
				});
				return;
			}
			// now that we know we got a successful response, download the file
			let chunks = [];
			response.on("data", (chunk) => {
				chunks.push(chunk);
			});
			response.on("end", () => {
				resolve(Buffer.concat(chunks));
			});
		});
	});
}

function canAccessChannel(interaction) {
	return (
		interaction.guildId &&
		interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ViewChannel) &&
		interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.SendMessages)
	);
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
	handleWebServerInteraction,
};
