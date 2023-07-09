// Takes in multer files, validates the files within it, and returns an array of
// buffers containing the files. If any of the files are invalid, it returns an error.
// TODO: sanitize files in this function as well

// Valid file mime types
const validMimes = ["image/png", "image/jpeg", "image/jpg", "text/plain", "text/markdown"];
// Valid file extensions for application/octet-stream files
const validAosExtensions = [".md"];

function validateFiles(files) {
	if (files.length == 0) {
		return Error("No files provided");
	}
	for (let i = 0; i < files.length; i++) {
		if (!validMimes.includes(files[i].mimetype)) {
			// Check if the file is a markdown file. If not, replace it with an error file.
			if (!(files[i].mimetype === "application/octet-stream" && files[i].originalname.endsWith(".md"))) {
				files[i] = {
					mimetype: "text/plain",
					buffer: Buffer.from(`
Uploaded File Error: Invalid file type:\n
\`${files[i].mimetype}\`\n
expected one of \`${validMimes.join(", ")}\``),
				};
			}
		}
	}
	// Return the array of files
	return files;
}

module.exports = { validateFiles };
