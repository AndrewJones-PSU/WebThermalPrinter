// This file holds all of the main logic for the print spooler. It is responsible for:
// 1. Adding files to the spooler queue
// 2. Sending files from the queue to the printer
// 3. Dealing with the nonsense that is the ESCPOS library

const config = require("./config.json");
const escpos = require("escpos");
const escposSerial = require("escpos-serialport");

// addToQueue takes in an image and adds it to the spooler queue
// WARNING: This function assumes that the image has already been validated
function addToQueue(image) {}

// addImagesToQueue takes in an array of images and adds them to the spooler queue
// WARNING: This function assumes that the images have already been validated
function addImagesToQueue(images) {
	for (let i = 0; i < images.length; i++) {
		addToQueue(images[i]);
	}
}

// startQueueLoop starts the spooler queue loop.
function startQueueLoop() {}

// queueLoop is the main loop of the spooler. It checks if the queue is empty every
// config.spooler.queueLoopInterval milliseconds and, if not empty, prints the entire queue.
// This function automatically calls itself every config.spooler.queueLoopInterval milliseconds.
// Do not call this directly, use startQueueLoop instead.
function queueLoop() {}

// printImage prints an image to the printer. More specifically, it:
// 1. Loads the image into the ESCPOS library
// 2. Initializes the printer
// 3. Prints the image
// 4. Closes the printer
function printImage(image) {}
