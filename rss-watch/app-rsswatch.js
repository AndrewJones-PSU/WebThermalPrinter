// check if dev environment, if so, import config.json and env.json from parent directory
// (in production, these files are imported by the build script, but in development,
// we want to be able to edit them without having to copy the file to
// every subdirectory that needs it).

if (process.env.NODE_ENV !== "production") {
	const fs = require("fs");
	console.log("Dev environment detected, copying configs from parent directory");
	fs.copyFileSync("./../config.json", "./config.json");
	fs.copyFileSync("./../env.json", "./env.json");
}

const Parser = require("rss-parser");
const parser = new Parser();
const { NodeHtmlMarkdown } = require("node-html-markdown");
const fs = require("fs");
const env = require("./env.json");

// initialize markdown converter with options
const nhm = new NodeHtmlMarkdown({ keepDataImages: true, useLinkReferenceDefinitions: false, useInlineLinks: false });

// retrieve feed from url
async function getFeed(url) {
	let feed = await parser.parseURL(url);
	return feed;
}

// retrieve list of feeds from file
async function getFeedsList(file) {
	// TODO: add error handling (i.e. file not found)
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

// main loop
async function main() {
	// get list of feeds from file
	let feeds = await getFeedsList("./feedslist.json");
	// parse list of feeds
	feeds = JSON.parse(feeds);
	// for each feed, get feed, compare to printed items json, print new items
	// TODO: check feed.interval for each feed, store last run time, only run if interval has passed
	feeds.forEach(async (feed) => {
		let feedObj = await getFeed(feed.url);
		let newItems = await getPrintedAndUpdate(`./printed/${feed.name}.json`, feedObj);
		newItems.forEach((item) => {
			console.log(item.title + ": " + item.link + "\n" + nhm.translate(item.content) + "\n");
		});
	});
	// rerun main loop every 5 minutes (300000ms)
	setTimeout(main, 300000);
}

main();
