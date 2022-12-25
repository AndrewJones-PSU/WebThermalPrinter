// Given a text or markdown file buffer, format it for printing, render it to a png, and return a jimp image of the png.
// the rendered text should appropriate interpret markdown, and should be formatted to fit on the page (config.img.width).

const config = require("../config.json");
const md = require("markdown-it")();
const puppeteer = require("puppeteer");
const Jimp = require("jimp");

let browser;
let page;

// Initialize the browser and page
// This is done outside textToImage so that the browser and page are only initialized once
// initializing the browser and page can take a while (500+ ms in some cases), so this saves a lot of time
async function init() {
	browser = await puppeteer.launch();
	page = await browser.newPage();
	await page.setViewport({
		width: config.img.width,
		height: 0,
	});
	console.log("Puppeteer Browser and Page initialized");
}

async function textToImage(textFile) {
	// check if the browser and page have been initialized, and if not, initialize them
	if (!browser || !page) {
		await init();
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
	// TODO: implement this

	// Render the page to a png
	// start by setting the page content
	page.setContent(html);
	// then take a screenshot
	screenshot = page.screenshot({ type: "png", fullPage: true, encoding: "base64" });
	// convert the screenshot to a jimp image and return
	return Jimp.read(Buffer.from(screenshot, "base64"));
}
