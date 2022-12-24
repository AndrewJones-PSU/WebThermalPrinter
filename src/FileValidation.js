// Takes in a string of base64 files separated by commas, validates them, and returns an array of
// buffers containing the files. If any of the files are invalid, it returns an error.
function validateFiles(filestr) {
	// Split the files into an array
	let files = filestr.split(",");
	let fileBuffers = [];
	// Loop through each file
	for (let i = 0; i < files.length; i++) {
		// Get buffer from base64 string
		fileBuffers.push(Buffer.from(files[i], "base64"));
		// Make sure the file is a base64 file
		if (fileBuffers[i].toString("base64") !== files[i]) {
			return { error: "Invalid file type" };
		}
	}
	// Return the array of files
	return files;
}

module.exports = validateFiles;
