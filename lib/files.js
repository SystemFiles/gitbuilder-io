const fs = require('fs')
const { Spinner } = require('clui')
const path = require('path')
const _ = require('lodash')

const touch = (filePath) => {
	// Like the touch command but can specify path to
	fs.closeSync(fs.openSync(filePath, 'w'))
}

const writeGitIgnoreToProject = async (projectName, ignoreList) => {
	const status = new Spinner('Writing selected items to .gitignore ...')
	status.start()
	await fs.writeFile(`./${projectName}/.gitignore`, ignoreList.join('\n'), () => {
		status.stop()
	})
}

const getCurrentDirectory = () => {
	return process.cwd()
}

const getProjectDirectoryIfExists = (projectName) => {
	let attemptedPath = `${getCurrentDirectory()}/${projectName}`
	if (directoryExists(attemptedPath)) return attemptedPath
	return null
}

const makeProjectDirectory = async (projectName) => {
	fs.mkdirSync(projectName)
}

const directoryExists = (filePath) => {
	return fs.existsSync(filePath)
}

const getFileFoldersInDir = (path) => {
	let directory = path
	if (!path) directory = getCurrentDirectory()

	const filelist = _.without(fs.readdirSync(directory), '.git', '.gitignore')

	return filelist
}

module.exports = {
	getCurrentDirectory,
	directoryExists,
	getFileFoldersInDir,
	getProjectDirectoryIfExists,
	makeProjectDirectory,
	touch,
	writeGitIgnoreToProject
}
