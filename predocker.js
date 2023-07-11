// This file is a workaround for docker's inability to copy files outside of the
// build context. It should be ran prior to running any dockerfile and run again
// any time the config.json or env.json files are changed.

// In our dockerfiles, we need to copy config.json and env.json into the
// subdirectory for each process, but docker doesn't allow us to copy files from
// outside the build context. The workaround is to run this script before
// building the dockerfile to copy the files into the revelant subdirectories.

// Run this from the root directory, not the docker directory.

const fs = require("fs");

const subdirs = ["web-server", "print-spooler", "discord-bot", "rss-watch"];

// copy the files into each subdirectory
subdirs.forEach((subdir) => {
	fs.copyFileSync("./config.json", `./${subdir}/config.json`);
	fs.copyFileSync("./env.json", `./${subdir}/env.json`);
});

console.log("Done");
