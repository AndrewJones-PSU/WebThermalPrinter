// Given a base64 text or markdown file, format it for printing, render it to a png, and return the base64 string of the png.
// the rendered text should appropriate interpret markdown, and should be formatted to fit on the page (config.img.width).

const config = require("../config.json");
const marked = require("marked");
const puppeteer = require("puppeteer");

let browser;
let page;

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
	// check if the browser and page have been initialized
	if (!browser || !page) {
		await init();
	}
	// Convert the text/md file to html
	let markedhtml = marked(textFile);
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
	// then take a screenshot and return it
	return await page.screenshot({ type: "png", fullPage: true, encoding: "base64" });
}
