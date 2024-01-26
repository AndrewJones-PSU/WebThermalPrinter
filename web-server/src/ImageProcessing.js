// This file contains two main functions:

// formatImage(img)
// Given an image file buffer, format it for printing
// Formatting includes:
// - resizing to process.env.img.width (default is 576 px wide)
// - converting to black and white (NOT grayscale) using process.env.img.bwmethod (can be "none", "threshold", or "floyd-steinburg")
// returned image is a jimp image, or string if there was an error

// splitAndExport(img)
// Given an image file buffer, split it into multiple images if it exceeds process.env.img.maxheight
// after splitting, "export" the images out of jimp and into an array of PNG image buffers
// returns an array of PNG image buffers
// This function is used to split images that are too tall for the printer to handle + remove the jimp dependency

// Import modules
const config = require("./../config.json");
const Jimp = require("jimp");

async function formatImage(img) {
	// Validate the image by checking it is a buffer
	if (!Buffer.isBuffer(img)) {
		// If the buffer is invalid, return an error message
		// If a string is passed, return the string since it is probably an error message
		if (typeof img === "String") return img;
		return `Error in formatImage: Invalid input, expected buffer, got ${typeof img}`;
	}

	// Create a Jimp image from the buffer
	let image = await Jimp.read(img);
	// Resize the image
	image.resize(process.env.img.width, Jimp.AUTO);
	// Convert the image to black and white
	switch (process.env.img.bwmethod) {
		default: // if invalid, default to grayscale
			image = image.grayscale();
			break;
		case "none": // if none, just make grayscale and let the printer auto-threshold
			image = image.grayscale();
			break;
		case "threshold":
			image = image.threshold(process.env.img.threshold);
			break;
		case "floyd-steinberg":
			image = floydSteinberg(image);
			break;
	}
	// Return the Jimp image
	return image;
}

async function splitAndExport(img) {
	let images = [];
	// split the image into multiple images if it exceeds process.env.img.maxheight
	if (img.bitmap.height > process.env.img.maxheight) {
		// calculate the number of images needed
		let numImages = Math.ceil(img.bitmap.height / process.env.img.maxheight);
		// split the image into multiple images
		for (let i = 0; i < numImages; i++) {
			// calculate the height of the image
			// This will either be process.env.img.maxheight or the remaining height of the image
			let height = Math.min(process.env.img.maxheight, img.bitmap.height - i * process.env.img.maxheight);
			// crop the image
			let image = await img.clone().crop(0, i * process.env.img.maxheight, img.bitmap.width, height);
			// add the image to the array, exporting it out of jimp
			images.push(await image.getBufferAsync(Jimp.MIME_PNG));
		}
	} else {
		// if the image is not too tall, just add it to the array, exporting it out of jimp
		images.push(await img.getBufferAsync(Jimp.MIME_PNG));
	}
	return images;
}

// Given a Jimp image, convert it to black and white using the Floyd-Steinberg algorithm
function floydSteinberg(image) {
	// Convert to grayscale
	image = image.grayscale();
	// Get pixel values, make 2D array of black & white pixel values
	// TODO: do all of this directly in jimp instead of making a separate array
	let pixArray2d = new Array(image.bitmap.width).fill(0).map(() => new Array(image.bitmap.height).fill(0));
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			pixArray2d[x][y] = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
		}
	}
	// Convert to black and white using Floyd-Steinberg algorithm
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			let oldColor = pixArray2d[x][y];
			let newColor = thresholdRound(oldColor);
			pixArray2d[x][y] = newColor;
			let error = oldColor - newColor;
			if (x < image.bitmap.width - 1) {
				pixArray2d[x + 1][y] = pixArray2d[x + 1][y] + (error * 7) / 16;
			}
			if (x > 0 && y < image.bitmap.height - 1) {
				pixArray2d[x - 1][y + 1] = pixArray2d[x - 1][y + 1] + (error * 3) / 16;
			}
			if (y < image.bitmap.height - 1) {
				pixArray2d[x][y + 1] = pixArray2d[x][y + 1] + (error * 5) / 16;
			}
			if (x < image.bitmap.width - 1 && y < image.bitmap.height - 1) {
				pixArray2d[x + 1][y + 1] = pixArray2d[x + 1][y + 1] + (error * 1) / 16;
			}
		}
	}
	// Convert 2D array of black & white pixel values to Jimp image
	for (let x = 0; x < image.bitmap.width; x++) {
		for (let y = 0; y < image.bitmap.height; y++) {
			let color = thresholdRound(pixArray2d[x][y]);
			image.setPixelColor(Jimp.rgbaToInt(color, color, color, 255), x, y);
		}
	}
	return image;
}

// helper function for Floyd-Steinberg algorithm
function thresholdRound(value) {
	if (value < 128) {
		return 0;
	}
	return 255;
}

module.exports = { formatImage, splitAndExport };
