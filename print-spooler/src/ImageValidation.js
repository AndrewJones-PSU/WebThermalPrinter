// This file has one primary function: take in a file and validate they satisfy the following criteria:
// 1. It is a PNG image
// 2. The image is at most config.img.width x config.img.maxheight in size
// 3. The image is pure black and white (each pixel is either (0,0,0) or (255,255,255))

function validateImage(image) {
	return new Promise((resolve, reject) => {});
}

module.exports = { validateImage };
