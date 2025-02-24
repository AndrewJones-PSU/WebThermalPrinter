// This file holds all of the main logic for the print spooler. It is responsible for:
// 1. Adding files to the spooler queue
// 2. Sending files from the queue to the printer
// 3. Dealing with the nonsense that is the ESCPOS library

const fs = require("fs");
const rwlock = require("rwlock");
const Queue = require("./Queue.js");
const sizeOf = require("image-size");
const ThermalPrinterEncoder = require("thermal-printer-encoder");
const { SerialPort } = require("serialport");
const { createCanvas, Image } = require("canvas");

// We have two seperate queues, one for image data, another for image dimensions. The lock controls access to both queues.
let queueLock = new rwlock();
let queue = new Queue();
let dimsQueue = new Queue();

const encoder = new ThermalPrinterEncoder({
	language: "esc-pos",
});

// define serial port if the printer is through serial and not a file
let port;
if (process.env.printer_baudrate) {
	port = new SerialPort({
		path: process.env.printer_comport,
		baudRate: global.parseInt(process.env.printer_baudrate),
	});
}

// addImagesToQueue takes in an array of images and adds them to the spooler queue. Returns true on completion.
// WARNING: This function assumes that the images have already been validated!
async function addImagesToQueue(images) {
	queueLock.writeLock((release) => {
		for (let i = 0; i < images.length; i++) {
			// first, check if we're adding an image or a text file
			if (images[i].substr(0, 15) === "data:text/plain") {
				// if it's a text file, add it to the queue as plain text
				queue.push(Buffer.from(images[i].substr(23), "base64").toString());
				dimsQueue.push({ width: 0, height: 0 });
			} else {
				// otherwise, for the image, create a canvas object from it and add it to the queue
				let imageBuffer = Buffer.from(images[i].substr(22), "base64");
				let dimensions = sizeOf(imageBuffer);
				// create a canvas such that height is a multiple of 8
				dimensions.height = Math.ceil(dimensions.height / 8) * 8;
				let canvas = createCanvas(dimensions.width, dimensions.height);
				let ctx = canvas.getContext("2d");
				let img = new Image();
				img.onload = () => ctx.drawImage(img, 0, 0);
				img.src = imageBuffer;
				queue.push(img);
				dimsQueue.push(dimensions);
			}
		}
		release();
	});
	return true;
}

// startQueueLoop starts the spooler queue loop. This also resets the queue.
function startQueueLoop() {
	// Reset the queue
	queueLock.writeLock((release) => {
		queue = new Queue();
		dimsQueue = new Queue();
		release();
	});
	// Initialize the printer
	let result = encoder.initialize().encode();
	// Write result
	sendToPrinter(result);
	// start the queue loop
	queueLoop();
}

// queueLoop is the main loop of the spooler. It automatically checks if the queue is empty every
// config.spooler.queueLoopInterval milliseconds and, if not empty, prints the entire queue.
// This function should never be called directly, use startQueueLoop instead.
async function queueLoop() {
	queueLock.readLock((release) => {
		// Print the queue (this function doesn't do anything if the queue is empty)
		printQueue();
		// Call this function again in config.spooler.queueLoopInterval milliseconds
		setTimeout(queueLoop, global.parseInt(process.env.spooler_queueLoopInterval));
		release();
	});
}

// printQueue prints the entire queue. This function assumes we already have a read lock on the queue.
function printQueue() {
	if (queue.isEmpty()) return;
	while (!queue.isEmpty()) {
		let image = queue.pop();
		let dimensions = dimsQueue.pop();
		// check if the image is actually a command
		// if so, send the cmd, else print image
		if (typeof image === "string") printCMD(image);
		else printImage(image, dimensions);
	}
}

// printImage prints an image to the printer.
function printImage(image, dimensions) {
	let result = encoder.image(image, dimensions.width, dimensions.height).encode();
	sendToPrinter(result);
}

// printCMD sends a command to the printer. Returns true on completion,
// false if the command is not recognized.
function printCMD(text) {
	// now, we can check if the command is valid and if so, send it to the printer
	if (text == "CUT") {
		// note that prior to a cut, we need to add a few newlines
		// the exact number of newlines is defined in config.printer.cutNewlines
		let result = encoder;
		for (let i = 0; i < global.parseInt(process.env.printer_cutNewlines); i++) result = result.newline();
		result = result.cut().encode();
		sendToPrinter(result);
		return true;
	}
	// TODO: Add more commands as needed
	else return false;
}

function sendToPrinter(data) {
	if (process.env.baudRate) {
		port.write(data);
	} else {
		fs.writeFileSync(process.env.printer_comport, data);
	}
}

module.exports = { addImagesToQueue, startQueueLoop };
