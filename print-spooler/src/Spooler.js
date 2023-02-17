// This file holds all of the main logic for the print spooler. It is responsible for:
// 1. Adding files to the spooler queue
// 2. Sending files from the queue to the printer
// 3. Dealing with the nonsense that is the ESCPOS library

const config = require("./config.json");
const escpos = require("escpos");
const escposSerial = require("escpos-serialport");
const rwlock = require("rwlock");
const Queue = require("/Queue.js");

let queueLock = new rwlock();
let queue = new Queue();

// addImagesToQueue takes in an array of images and adds them to the spooler queue. Returns true on completion.
// WARNING: This function assumes that the images have already been validated!
function addImagesToQueue(images) {
	queueLock.writeLock((release) => {
		for (let i = 0; i < images.length; i++) {
			queue.push(images[i]);
		}
		release();
	});
	return true;
}

// startQueueLoop starts the spooler queue loop. This also resets the queue.
function startQueueLoop() {
	queueLock.writeLock((release) => {
		queue = new Queue();
		release();
	});
	queueLoop();
}

// queueLoop is the main loop of the spooler. It automatically checks if the queue is empty every
// config.spooler.queueLoopInterval milliseconds and, if not empty, prints the entire queue.
// This function should never be called directly, use startQueueLoop instead.
function queueLoop() {
	queueLock.readLock((release) => {
		// Print the queue (this function doesn't do anything if the queue is empty)
		printQueue();
		// Call this function again in config.spooler.queueLoopInterval milliseconds
		setTimeout(queueLoop, config.spooler.queueLoopInterval);
		release();
	});
}

// printQueue prints the entire queue. This function assumes we already have a read lock on the queue.
function printQueue() {
	while (!queue.isEmpty()) {
		let image = queue.pop();
		// check if the image is actually a command
		// if so, send the cmd, else print image
		if (image.mimetype == "text/plain") printCMD(image);
		else printImage(image);
	}
}

// printImage prints an image to the printer. More specifically, it:
// 1. Loads the image into the ESCPOS library
// 2. Initializes the printer
// 3. Prints the image
// 4. Closes the printer
function printImage(image) {}

// printCMD sends a command to the printer. More specifically, it:
// 1. Initializes the printer
// 2. Sends the command
// 3. Closes the printer
function printCMD(cmd) {}

module.exports = { addImagesToQueue, startQueueLoop };
