const fs = require('fs-extra')
const path = require('path')
const process = require('process')
const _ = require('lodash')

// Mine
const remoteTemplate = require('../lib/remote-templates')

// Like the touch command but can specify path too
const touch = (filePath) => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}

const writeGitIgnoreToProject = async (projectName, ignoreList) => {
	await fs.appendFile(`./${projectName}/.gitignore`, ignoreList.join('\n')).catch((err) => {
		throw new Error('Problem writing to .gitignore => ' + err)
	})
}

const getNodePackageRootDir = () => {
	return path.dirname(require.main.filename)
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
	let fullPath = `${getNodePackageRootDir()}/templates/readme/${selected}.md`
	let destPath = `${getProjectDirectoryIfExists(projectName)}/README.md`

	// Copy the file
	await fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: true })
}

const copyProjectTemplate = async (projectName, language, template) => {
	let destPath = `${getProjectDirectoryIfExists(projectName)}/`
	let fullPath = `${getNodePackageRootDir()}/templates/projects/${language}/${template}/`

	// Copy project contents
	await fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: false })
}

const copyProjectTemplateFromRepo = async (projectName, gitURL) => {
	let destPath = `${getProjectDirectoryIfExists(projectName)}`
	let repoObj = remoteTemplate.parseGitHubURL(gitURL)

	// Download project into target project directory...
	await remoteTemplate.getRemoteTemplate(repoObj.user, repoObj.repo, repoObj.ref, destPath)
}

const copyCIConfigTemplate = async (projectName, template) => {
	let fullPath = `${getNodePackageRootDir()}/templates/ci-config/.${template}.yml`
	let destPath = `${getProjectDirectoryIfExists(projectName)}/.${template}.yml`

	// Copy ci configuration template to destination
	await fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: false })
}

module.exports = {
	getCurrentDirectory,
	directoryExists,
	getFileFoldersInDir,
	getProjectDirectoryIfExists,
	makeProjectDirectory,
	touch,
	writeGitIgnoreToProject,
	copyReadmeTemplateToProjects,
	copyProjectTemplate,
	copyProjectTemplateFromRepo,
	copyCIConfigTemplate,
	getNodePackageRootDir
}
