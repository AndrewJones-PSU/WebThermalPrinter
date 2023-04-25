// This file is a workaround for docker's inability to copy files outside of the
// build context. It should be ran prior to running any dockerfile and run again
// any time the config.json or env.json files are changed.

// In our dockerfiles, we need to copy config.json and env.json into the
// subdirectory for each process, but docker doesn't allow us to copy files from
// outside the build context. The workaround is to run this script before
// building the dockerfile to copy the files into every subdirectory.

// Run this from the root directory, not the docker directory.

const fs = require("fs");
const path = require("path");

// Get every subdirectory in the project folder
const subdirs = fs.readdirSync("./").filter((file) => {
	return fs.statSync(path.join("./", file)).isDirectory();
});

// remove any subdirectories that are in the gitignore + the .git folder
const gitignore = fs.readFileSync("./.gitignore", "utf8");
const gitignoreLines = gitignore.split("\n");
gitignoreLines.push(".git");
gitignoreLines.forEach((line) => {
	for (let i = 0; i < subdirs.length; i++) {
		if (subdirs[i] === line) {
			subdirs.splice(i, 1);
			i--;
		}
	}
});

// copy the files into each subdirectory
subdirs.forEach((subdir) => {
	fs.copyFileSync("./config.json", `./${subdir}/config.json`);
	fs.copyFileSync("./env.json", `./${subdir}/env.json`);
});

console.log("Done");
