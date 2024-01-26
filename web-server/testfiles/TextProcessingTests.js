// This file validates the operation of the function "textToImage(textFile)" within src/TextToImage.js

// Import modules
// const config = require("../../config.json");
const fs = require("fs");
const TextToImage = require("../src/TextToImage.js");
const ImageProcessing = require("../src/ImageProcessing.js");

// This function takes text files from the testfiles/text folder and runs them through
// the textToImage(textFile) function. The output images are saved to the testfiles/output folder.
function validateTextFunctions() {
	return new Promise((resolve, reject) => {
		console.time("validateTextFunctions");
		console.time("loadingText");
		// Load text files from testfiles/text and store them in an array as buffers
		let filenames = fs.readdirSync("text");
		let textFiles = [];
		for (let i = 0; i < filenames.length; i++) {
			let textFile = fs.readFileSync("text/" + filenames[i]);
			textFiles.push(textFile);
		}
		console.timeEnd("loadingText");
		console.log("Loaded " + textFiles.length + " text files.");

		// Run text files through textToImage(textFile)
		// textToImage(textFile) returns a promise, so we'll promise.all() it
		console.time("textToImage");
		let textImages = [];
		for (let i = 0; i < textFiles.length; i++) {
			textImages.push(TextToImage.textToImage(textFiles[i]));
		}
		Promise.all(textImages).then((textImages) => {
			console.timeEnd("textToImage");
			// Run formatted images through splitAndExport(img)
			// splitAndExport(img) also returns a promise, so we'll promise.all() it

			console.time("splittingImages");
			let splitImages = [];
			for (let i = 0; i < textImages.length; i++) {
				splitImages.push(ImageProcessing.splitAndExport(textImages[i]));
			}
			Promise.all(splitImages).then((splitImages) => {
				console.timeEnd("splittingImages");
				// Save split images to testfiles/output
				console.time("savingImages");
				for (let i = 0; i < splitImages.length; i++) {
					for (let j = 0; j < splitImages[i].length; j++) {
						fs.writeFileSync("output/" + filenames[i] + "-split-" + j + ".png", splitImages[i][j]);
					}
				}
				console.timeEnd("savingImages");
				console.timeEnd("validateTextFunctions");
				resolve("Done!");
			});
		});
	});
}

// Run the function
validateTextFunctions().then((result) => {
	console.log(result);
	TextToImage.puppeteerClose();
});
