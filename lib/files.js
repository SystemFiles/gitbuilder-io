const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const getCurrentDirectory = () => {
	return path.basename(process.cwd())
}

const directoryExists = (filePath) => {
	return fs.existsSync(filePath)
}

const getFileFoldersInDir = async (path) => {
	let filesFolders = []
	let directory = path
	if (!path) directory = getCurrentDirectory()

	_.without(
		fs.readdir(path, (err, files) => {
			if (!err) {
				files.forEach((file) => {
					filesFolders.push(file)
				})
			} else {
				throw new Error(err)
			}
		}),
		'.git',
		'.gitignore'
	)

	return filesFolders
}

module.exports = {
	getCurrentDirectory,
	directoryExists,
	getFileFoldersInDir
}
