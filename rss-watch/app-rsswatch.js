// check if dev environment, if so, import config.json and env.json from parent directory
// (in production, these files are imported by the build script, but in development,
// we want to be able to edit them without having to copy the file to
// every subdirectory that needs it).

if (process.env.NODE_ENV !== "production") {
	const fs = require("fs");
	console.warn("Dev environment detected, copying configs from parent directory.");
	console.warn(
		"Since environment variables are loaded before this script runs, you may need to restart this process for changes to take effect."
	);
	fs.copyFileSync("./../config.json", "./config.json");
	fs.copyFileSync("./../.env", "./.env");
}

require("dotenv").config();
const Parser = require("rss-parser");
const parser = new Parser();
const { NodeHtmlMarkdown } = require("node-html-markdown");
const http = require("http");
const formdata = require("form-data");
const fs = require("fs");

// initialize markdown converter with options
const nhm = new NodeHtmlMarkdown({ keepDataImages: true, useLinkReferenceDefinitions: false, useInlineLinks: false });

// retrieve feed from url
async function getFeed(url) {
	let feed;
	try {
		feed = await parser.parseURL(url);
	} catch (err) {
		console.error(`Error getting Feed from ${url}!\n${err}`);
		return {};
	}
	return feed;
}

// retrieve list of feeds from file
function getFeedsList(file) {
	let feeds = fs.readFileSync(file, "utf8");
	return feeds;
}

// retrieve list of printed items from json file, compare to feed, add new items to json file, return new items
// If the file doesn't exist, it will be created, current feed will be added to it, and an empty object will be returned.
async function getPrintedAndUpdate(file, feed) {
	// get list of printed items from file
	// also handles files not found
	let printed;
	let newItems = [];
	let eonent = false;

	// return nothing if feed is empty
	if (!("items" in feed))
		return []

	// make sure the directory exists, if not, create it
	if (!fs.existsSync("./printed")) {
		fs.mkdirSync("./printed");
	}
	// try to read and parse file, if it doesn't exist, create it
	try {
		printed = JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (err) {
		if (err.code === "ENOENT") {
			// file not found, use empty array
			printed = [];
			eonent = true;
		} else {
			// if some other error, throw
			throw err;
		}
	}

	// compare feed to printed items, add new items to newItems
	feed.items.forEach((item) => {
		// check if item has already been printed, if not, add to newItems.
		let found = false;
		printed.forEach((printedItem) => {
			if (printedItem.link === item.link && printedItem.date === item.isoDate) {
				found = true;
				return;
			}
		});
		// if item not found, add to newItems
		// Note we add the whole item to this array, but we only write the link and date to the file
		if (!found) {
			newItems.push(item);
		}
	});

	// if new items exist, add to printed items in file
	if (newItems.length > 0) {
		let newPrinted = printed;
		newItems.forEach((item) => {
			newPrinted.push({ link: item.link, date: item.isoDate });
		});
		await fs.writeFileSync(file, JSON.stringify(newPrinted));
	}
	// if file doesn't exist, return empty array (this is the first time the feed has been run, we don't want to print everything immediately)
	if (eonent) {
		return [];
	}
	// otherwise, return new items
	return newItems;
}

// send request to web server given an rss item, log any errors
async function sendRequest(item) {
	// create form data
	let form = new formdata();
	// create string for file to send
	let data = "# " + item.title + "\n" + item.link + "\n\n" + nhm.translate(item.content);
	// add data to form
	form.append("allfiles", Buffer.from(data), {
		filename: "rsswatch.txt",
		contentType: "text/plain",
	});
	// create and send request
	let request = http.request({
		method: "POST",
		host: process.env.webIP,
		path: "/print",
		port: process.env.webPort,
		headers: form.getHeaders(),
	});
	form.pipe(request);
	// check if request was successful, if not, log error to console + log file
	request.on("error", (res) => {
		logError(item.title, item.link, res, false);
	});
	// log request to console + log file if web server returns error
	request.on("response", (res) => {
		if (res.statusCode !== 200) {
			logError(item.title, item.link, res, true);
		}
	});
}

// log error to console + log file
// fromServer is true if the error is from the web server, false if it's from the request
function logError(itemName, url, err, fromServer) {
	// make a date/time string in the local timezone
	let dateStr = new Date().toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, {
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});
	// create error string based on type of error
	let errorString;
	if (fromServer) {
		errorString =
			dateStr +
			' - Error from web server for item "' +
			itemName +
			'" from url "' +
			url +
			'": ' +
			err.statusCode +
			", " +
			err.statusMessage;
	} else {
		errorString =
			dateStr +
			' - Error sending request to web server for item "' +
			itemName +
			'" from url "' +
			url +
			'": ' +
			err;
	}
	console.error(errorString);
	fs.appendFileSync("./error.log", errorString + "\n");
}

// main loop
async function main() {
	// get list of feeds from file
	let feeds = getFeedsList("./feedslist.json");
	// parse list of feeds
	feeds = JSON.parse(feeds);
	// for each feed, get feed, compare to printed items json, print new items
	// TODO: check feed.interval for each feed, store last run time, only run if interval has passed
	feeds.forEach(async (feed) => {
		let feedObj = await getFeed(feed.url);
		let newItems = await getPrintedAndUpdate(`./printed/${feed.name}.json`, feedObj);
		newItems.forEach((item) => {
			sendRequest(item);
		});
	});
	// rerun main loop every 5 minutes (300000ms)
	setTimeout(main, 300000);
}

main();
