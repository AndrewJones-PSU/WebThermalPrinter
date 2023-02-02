// This file tests whether requests to http://localhost:PORT/ are handled correctly.
// Note: app.js must be running for this to work.
const http = require("http");
const config = require("../../config.json");
const fs = require("fs");
const formdata = require("form-data");

// PORT is the port that app.js is running on
// HOST is the base URL of the server, change this if running app.js externally
const PORT = config.server.port;
const HOST = `localhost`;

// basic test to verify server is running
// returns 0 if successful, 1 on error, 2 on unexpected response
async function awakeTest() {
	return new Promise((resolve, reject) => {
		let options = {
			method: "GET",
			host: HOST,
			path: "",
			port: PORT,
		};
		http.get(options, (res) => {
			if (res.statusCode === 200) {
				res.on("data", (d) => {
					if (d == "Service is running") {
						console.log("AwakeTest: successful");
						resolve(0);
					} else {
						console.warn("AwakeTest: Unexpected data with 200(OK) status from server: " + d);
						resolve(2);
					}
				});
			} else {
				console.warn("AwakeTest: Unexpected status code from server: " + res.statusCode);
				resolve(2);
			}
		}).on("error", (e) => {
			if (e.code === "ECONNREFUSED") {
				console.error(`AwakeTest: Connection refused at ${BaseURL}, are you sure app.js is running?`);
				resolve(1);
			} else {
				console.error("AwakeTest: Unhandled Error Occured:" + e);
				resolve(1);
			}
		});
	});
}

// send a request to /preview with no files
// returns 0 if successful, 1 on error, 2 on unexpected response
async function previewNoFilesTest() {
	return new Promise((resolve, reject) => {
		let options = {
			method: "GET",
			host: HOST,
			path: "preview",
			port: PORT,
		};
		http.get(options, (res) => {
			if (res.statusCode === 400) {
				res.on("data", (d) => {
					if (d == "Error: No files provided") {
						console.log("previewNoFilesTest: successful");
						resolve(0);
					} else {
						console.warn(
							"previewNoFilesTest: Unexpected data with correct status (400, Bad Request) from server: " +
								d
						);
						resolve(2);
					}
				});
				console.warn("previewNoFilesTest: Server returned correct status (400, Bad Request) but no data");
			} else {
				console.warn("previewNoFilesTest: Unexpected status code from server: " + res.statusCode);
				resolve(2);
			}
		}).on("error", (e) => {
			console.error("Error Occured in previewNoFilesTest:" + e);
			resolve(1);
		});
	});
}

// send a request to /preview with a single file
// returns 0 if successful, 1 on error, 2 on unexpected response
async function previewSingleFileTest() {
	let form = new formdata();
	form.append("file", fs.createReadStream("jpg/jpgTest1.jpg"));
	const options = {
		method: "GET",
		host: HOST,
		path: "preview",
		port: PORT,
	};
	form.submit(options, (err, res) => {
		if (err) {
			console.error("Error Occured in previewSingleFileTest:" + err);
			return 1;
		}
		if (res.statusCode === 200) {
			res.on("data", (d) => {
				// save the data to a file
				console.log(d);
				fs.writeFileSync("previewSingleFileTest.jpg", d, (err) => {
					if (err) {
						console.error("previewSingleFileTest: Error writing file: " + err);
						return 1;
					}
					console.log("previewSingleFileTest: successful");
					return 0;
				});
			});
		} else {
			console.warn("previewSingleFileTest: Unexpected status code from server: " + res.statusCode);
			return 2;
		}
	});
}

// run all tests
async function runTests() {
	let awakeTestResult = await awakeTest();
	console.log(awakeTestResult);
	if (awakeTestResult == 0 || awakeTestResult == 2) {
		console.log("Running other tests");
		if (awakeTestResult == 2) {
			console.warn("Note that awakeTest failed, other tests may fail as well");
		}
		console.log(await previewNoFilesTest());
		console.log(await previewSingleFileTest());
	}
}

runTests();
