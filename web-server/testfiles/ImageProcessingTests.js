// This file validates the operation of the functions within src/ImageProcessing.js
// There are two main functions to validate:
// - formatImage(img)
// - splitAndExport(img)

// CURRENT RESULTS (as of 2023-01-19):
// formatImage(img) works as expected
// splitAndExport(img) works as expected
//
// TODO: formatImage(img) is very slow, appears to be mainly from reading the image
// from a buffer into Jimp. This might be able to be optimized by caching Jimp instances
// and reusing them, if that's possible. Not an urgent issue, but something to fix in the future.

// Import modules
// const config = require("../../config.json");
const fs = require("fs");
const ImageProcessing = require("../src/ImageProcessing.js");

// This function takes images from the testfiles/jpg folder and runs them through
// both the formatImage(img) function and the splitAndExport(img) function. The
// output images are saved to the testfiles/output folder.
// Note this function is expected to be run in the testfiles folder
function validateImageFunctions() {
	return new Promise((resolve, reject) => {
		console.time("validateImageFunctions");
		console.time("loadingImages");
		// Load images from testfiles/jpg and store them in an array as buffers
		let filenames = fs.readdirSync("jpg");
		let images = [];
		for (let i = 0; i < filenames.length; i++) {
			let img = fs.readFileSync("jpg/" + filenames[i]);
			images.push(img);
		}
		console.timeEnd("loadingImages");
		console.log("Loaded " + images.length + " images.");

		// Run images through formatImage(img)
		// formatImage(img) returns a promise, so we'll promise.all() it
		console.time("formattingImages");
		let formattedImages = [];
		for (let i = 0; i < images.length; i++) {
			formattedImages.push(ImageProcessing.formatImage(images[i]));
		}
		Promise.all(formattedImages).then((formattedImages) => {
			console.timeEnd("formattingImages");
			// Run formatted images through splitAndExport(img)
			// splitAndExport(img) also returns a promise, so we'll promise.all() it
			console.time("splittingImages");
			let splitImages = [];
			for (let i = 0; i < formattedImages.length; i++) {
				splitImages.push(ImageProcessing.splitAndExport(formattedImages[i]));
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
				console.timeEnd("validateImageFunctions");
				resolve("Done!");
			});
		});
	});
}

// Run the function
validateImageFunctions().then((result) => {
	console.log(result);
});
