// This file has one primary function: take in a file and validate they satisfy the following criteria:
// 1. It is a PNG image
// 2. The image is at most config.img.width x config.img.maxheight in size
// 3. The image is pure black and white (each pixel is either (0,0,0) or (255,255,255))
// The function returns an array with two elements, the first being a boolean indicating whether the image is valid,
// and the second being a string containing an error message if the image is invalid.
// This function also returns true for txt files, which are interpreted as a command (for example, "cut")

const config = require("../../config.json");
const sizeOf = require("image-size");

function validateImage(image) {
	// Check if the image is a txt file (these files are interpreted as commands)
	if (image.mimetype === "text/plain") {
		return [true, "TXT"];
	}

	// Check that the image is a PNG
	if (image.mimetype !== "image/png") {
		return [false, "Not a PNG Image"];
	}
	// Get image dimensions
	let imageDims = sizeOf(image.path);

	// Check that the image is the proper width and is not too tall
	if (imageDims.width != config.img.width) {
		return [false, "Image width is not " + config.img.width + "(given " + imageDims.width + ")"];
	}
	if (imageDims.height > config.img.maxheight) {
		return [false, "Image height is greater than " + config.img.maxheight + "(given " + imageDims.height + ")"];
	}

	// Check that the image is pure black and white
	// Start by creating a canvas and drawing the image on it
	var canvas = document.createElement("canvas");
	canvas.width = imageDims.width;
	canvas.height = imageDims.height;
	var context = canvas.getContext("2d");
	context.drawImage(image, 0, 0);
	var imageData = context.getImageData(0, 0, image.width, image.height);
	var data = imageData.data;
	// Check that each pixel is either (0,0,0) or (255,255,255)
	for (var i = 0; i < data.length; i += 4) {
		switch (data[i]) {
			// If the red value is 0, check that the green and blue values are also 0, and vice versa.
			case 0:
				if (data[i + 1] !== 0 || data[i + 2] !== 0) return [false, "Image is not pure black and white"];
				break;
			case 255:
				if (data[i + 1] !== 255 || data[i + 2] !== 255) return [false, "Image is not pure black and white"];
				break;
			default:
				return [false, "Image is not pure black and white"];
		}
	}
	return [true, "OK"];
}

module.exports = { validateImage };
