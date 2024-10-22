// This file has two primary functions:
//
// A: Take in an array of image buffers and encode them into base64 strings
//
// B: take in a file and validate they satisfy the following criteria:
// 1. It is a PNG image
// 2. The image is at most process.env.img.width x process.env.img.maxheight in size
// The function returns an array with two elements, the first being a boolean indicating whether the image is valid,
// and the second being a string containing an error message if the image is invalid.
// This function also returns true for txt files, which are interpreted as a command (for example, "cut")

const sizeOf = require("image-size");

function bufferToBase64(buffer) {
	return "data:image/png;base64," + buffer.toString("base64");
}

function validateImage(image) {
	// Check if the image is a txt file (these files are interpreted as commands)
	if (image.substr(0, 15) === "data:text/plain") {
		return [true, "TXT"];
	}

	// Check that the image is a PNG
	if (image.substr(0, 14) !== "data:image/png") {
		return [false, "Not a PNG Image"];
	}

	// Convert the image to a buffer
	let imageBuffer = Buffer.from(image.substr(22), "base64");
	// Get image dimensions
	let imageDims = sizeOf(imageBuffer);

	// Check that the image is the proper width and is not too tall
	if (imageDims.width != global.parseInt(process.env.img_width)) {
		return [
			false,
			"Image width is not " + global.parseInt(process.env.img_width) + "(given " + imageDims.width + ")",
		];
	}
	if (imageDims.height > global.parseInt(process.env.img_maxheight)) {
		return [
			false,
			"Image height is greater than " +
				global.parseInt(process.env.img_maxheight) +
				"(given " +
				imageDims.height +
				")",
		];
	}
	return [true, "OK"];
}

module.exports = { bufferToBase64, validateImage };
