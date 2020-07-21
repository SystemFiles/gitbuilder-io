const fs = require('fs-extra')
const path = require('path')
const { Spinner } = require('clui')
const _ = require('lodash')

// Like the touch command but can specify path too
const touch = (filePath) => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}

const writeGitIgnoreToProject = async (projectName, ignoreList) => {
	await fs.writeFile(`./${projectName}/.gitignore`, ignoreList.join('\n')).catch((err) => {
		throw new Error('Problem writing to .gitignore => ' + err)
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
	const filelist = _.without(fs.readdirSync(directory, { encoding: 'utf8' }), '.git', '.gitignore')
	let result = []

	filelist.forEach((file) => {
		if (fs.statSync(`${directory}/${file}`).isDirectory()) {
			result.push(file + '/')
		} else {
			result.push(file)
		}
	})

	return result
}

const copyReadmeTemplateToProjects = async (projectName, selected) => {
	let fullPath = `${path.dirname(require.main.filename)}/templates/readme/${selected}.md`
	let destPath = `${getProjectDirectoryIfExists(projectName)}/README.md`

	// Copy the file
	await fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: true })
}

const copyProjectTemplate = async (projectName, language, template) => {
	// TODO: complete function definition
}

module.exports = {
	getCurrentDirectory,
	directoryExists,
	getFileFoldersInDir,
	getProjectDirectoryIfExists,
	makeProjectDirectory,
	touch,
	writeGitIgnoreToProject,
	copyReadmeTemplateToProjects
}
