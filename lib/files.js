const fs = require('fs')
const path = require('path')
const { Spinner } = require('clui')
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
	let destFS = fs.createWriteStream(`${getProjectDirectoryIfExists(projectName)}/README.md`, {
		flags : 'w'
	})
	if (directoryExists(fullPath)) {
		fs.readFile(fullPath, { encoding: 'utf8' }, (err, data) => {
			if (!err) {
				destFS.write(data, (err) => {
					if (err) throw new Error(`Problem writing to filestream... ${err}`)
				})
			} else {
				throw new Error(`Problem reading file at ${fullPath}. ${err}`)
			}
		})
	} else {
		throw new Error('Selected README file type is invalid or does not exist...')
	}
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
