// Given a text or markdown file buffer, format it for printing, render it to a png, and return a jimp image of the png.
// the rendered text should appropriate interpret markdown, and should be formatted to fit on the page (config.img.width).

const config = require("/config.json");
const md = require("markdown-it")();
const puppeteer = require("puppeteer");
const Jimp = require("jimp");
const https = require("https");
const ImageProcessing = require("./ImageProcessing.js");

let browser;
let page;

// Initialize the browser and page
// This is done outside textToImage so that the browser and page are only initialized once
// initializing the browser and page can take a while (500+ ms in some cases), so this saves a lot of time
async function puppeteerInit() {
	browser = await puppeteer.launch();
	page = await browser.newPage();
	await page.setViewport({
		width: config.img.width,
		height: 0,
	});
	console.log("Puppeteer Browser and Page initialized");
}

// deinit function to close the browser when we want to close the application
function puppeteerClose() {
	browser.close().then(() => {
		browser = null;
		page = null;
		console.log("Puppeteer Browser and Page deinitialized");
	});
}

async function textToImage(textFile) {
	// check if the browser and page have been initialized, and if not, initialize them
	if (!page) {
		await puppeteerInit();
	}
	// Convert the text/md file to html
	// remember that textFile is a buffer, so we convert it to a string here
	let markedhtml = md.render(textFile.toString());
	// Add HTML to properly size the page/text
	let html = `
<html>
	<head>
		<style>
			body {
				margin: 0;
				font-size: 2em;
			}
			code {
				white-space: pre-wrap;
			}
		</style>
	</head>
	<body>
		${markedhtml}
	</body>
</html>`;

	// scan through the HTML and check for any images
	// if there are images, download them, format them using ImageProcessing.js, and replace the src with the local path
	newImages = await parseAndFormatImages(html);
	// replace the src tags in the html with data URIs
	// Note that currently we exclude all other HTML/CSS formatting from the image tags and fix the width to 576px
	// TODO: preserve HTML/CSS tags (this will require modifying ImageProcessing.js as well, should be simple tbh)
	for (let i = 0; i < newImages[0].length; i++) {
		// double check that the image is actually an image
		if (typeof newImages[0][i] === "String") {
			// if it's a string, it's an image download error message from parseAndFormatImages, put in HTML
			html = html.replace(newImages[1][i], `<p><code>${newImages[0][i]}</code></p>`);
		}
		// replace the src with a data URI
		newImages[0][i].getBase64(Jimp.MIME_PNG, (err, src) => {
			html = html.replace(newImages[1][i], `<img src="${src}" width=${config.img.width}/>`);
		});
	}

	// Render the page to a png
	// start by setting the page content and waiting for it to load
	await page.setContent(html);
	// then take a screenshot, convert to jimp image, and return
	return new Promise((resolve, reject) => {
		screenshot = page
			.screenshot({
				width: config.img.width,
				type: "png",
				fullPage: true,
				captureBeyondViewport: true,
				encoding: "binary",
			})
			.then((screenshot) => {
				resolve(Jimp.read(screenshot));
			});
	});
}

// this function scans through the input text HTML and checks for any image tags
// if there are images, download them, format them using ImageProcessing.js, and return the Jimp images
// returned as a promise that resolves to an array of [images, imgTags], where images is an array of Jimp images
// and imgTags is an array of the original img tags (for replacing the src with a data URI)
async function parseAndFormatImages(html) {
	// Start by getting all the img tags
	let imgTags = html.match(/<img [^>]*>/g);

	// if there are no img tags, return an empty array of 2 empty arrays
	if (!imgTags) {
		return [[], []];
	}

	// map the function to get the images from the img tags
	let mapping = imgTags.map(getImage);

	// return a promise that resolves when all the images have downloaded and been formatted
	return Promise.all(mapping).then((images) => {
		// once the images have downloaded, format them
		// return them + the original img tags
		let newmap = images.map(ImageProcessing.formatImage);
		return Promise.all(newmap).then((newimages) => {
			return [newimages, imgTags];
		});
	});
}

// downloads an image from an HTML img tag and returns it's buffer in a promise
async function getImage(imgTag) {
	return new Promise((resolve, reject) => {
		// Get the src attribute
		let src = imgTag.match(/src="[^"]*"/g);
		// Trim off the src tag and array
		src = src[0].slice(5, -1);
		// download the image
		https.get(src, (response) => {
			// check that we actually got a successful response
			if (response.statusCode < 200 || response.statusCode > 299) {
				response.resume();
				reject("Error: Image Download failed, status code: " + response.statusCode);
			}
			// check if the response is an image
			if (response.headers["content-type"].startsWith("image/")) {
				// if it is, download it
				let chunks = [];
				response.on("data", (chunk) => {
					chunks.push(chunk);
				});
				response.on("end", () => {
					resolve(Buffer.concat(chunks));
				});
			} else {
				// if it isn't, reject the promise
				reject("Error: Download URL is not an image");
			}
		});
	});
}

module.exports = { textToImage, puppeteerInit, puppeteerClose };
