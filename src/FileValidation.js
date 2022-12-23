// Takes in a string of base64 files separated by commas, validates them, and returns an array of
// strings, each of which is a base64 file.
// If any of the files are invalid, it returns an error.
function validateFiles(filestr) {
	// Split the files into an array
	let files = filestr.split(",");
	// Loop through each file
	for (let i = 0; i < files.length; i++) {
		// Make sure the file is a base64 file
		if (Buffer.from(files[i], "base64").toString("base64") !== files[i]) {
			return { error: "Invalid file type" };
		}
	}
	// Return the array of files
	return files;
}

module.exports = validateFiles;
