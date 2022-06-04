const fs = require('fs-extra')
const Axios = require('axios')
const anzip = require('anzip')
const FormData = require('form-data')
const path = require('path')
const process = require('process')
const _ = require('lodash')
const { Spinner } = require('clui')
const chalk = require('chalk')
const remoteTemplate = require('../lib/remote-templates')

// ENDPOINTS
const TEMPLATES_API_ENDPOINT = 'https://gb.sykesdev.ca/api/template'

// Like the touch command but can specify path too ;)
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
	let attemptedPath = `${getCurrentDirectory()}/${projectName}` // Also escape spaces in path
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
	await /* TODO: JSFIX could not patch the breaking change:
    Allow copying broken symlinks 
    Suggested fix: You can use the exists and existsSync functions https://nodejs.org/api/fs.html#fsexistspath-callback from the fs module to check if a symlink is broken. */
    fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: true })
}

const getProjectTemplates = async (language) => {
	try {
		// Make request for list of project templates available
		let resp = await Axios({
			url    : TEMPLATES_API_ENDPOINT,
			method : 'GET',
			params : {
				lang : language
			}
		})

		if (resp.status === 200 && resp.data.status === 'LIST') return resp.data.list
		else
			throw new Error(
				`Failed to make request for available project templates to ${TEMPLATES_API_ENDPOINT} (${resp.status})`
			)
	} catch (err) {
		return new Error(
			`Error trying to retrieve list of available project templates from cloud storage API...\n`
		)
	}
}

const copyProjectTemplate = async (projectName, language, template) => {
	let destPath = `${getProjectDirectoryIfExists(projectName)}`
	let destFS = fs.createWriteStream(`${destPath}/${template}.zip`)

	try {
		// Make request for project template from gitbuilder templates API
		let resp = await Axios({
			url          : TEMPLATES_API_ENDPOINT,
			method       : 'GET',
			responseType : 'stream',
			params       : {
				lang : language,
				name : template
			}
		})

		// If there were no problems with the request, pipe the data into the destination file
		if (resp.status === 200) {
			resp.data.pipe(destFS)

			return new Promise((resolve, reject) => {
				destFS.on('finish', () => {
					// Unzip contents and remove zip file from project
					try {
						// Unzip the file contents of project reposiotry
						anzip(`${destPath}/${template}.zip`, {
							outputPath : `${destPath}/`
						})
							.then(async () => {
								await fs.remove(`${destPath}/${template}.zip`)
								resolve()
							})
							.catch(reject)
					} catch (err) {
						throw new Error(`Problem unzipping archived project template...(${template}.zip)\n${err}`)
					}
				})
				destFS.on('error', reject)
			})
		} else {
			throw new Error(`Failed to make request to ${TEMPLATES_API_ENDPOINT} (${resp.status})`)
		}
	} catch (err) {
		throw new Error(`Error occurred downloading template from cloud storage...\n${err}`)
	}
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
	await /* TODO: JSFIX could not patch the breaking change:
    Allow copying broken symlinks 
    Suggested fix: You can use the exists and existsSync functions https://nodejs.org/api/fs.html#fsexistspath-callback from the fs module to check if a symlink is broken. */
    fs.copy(fullPath, destPath, { errorOnExist: false, overwrite: false })
}

const uploadProjectTemplate = async (templateData) => {
	const loader = new Spinner(chalk.blue('Uploading project template to remote host...'))
	const formData = new FormData()
	formData.append(
		'file',
		fs.createReadStream(templateData['upload_path']),
		path.basename(templateData['upload_path'])
	)

	try {
		// Make request for project template from gitbuilder templates API
		loader.start()
		let resp = await Axios({
			url              : `${TEMPLATES_API_ENDPOINT}?lang=${templateData['upload_lang']}`,
			method           : 'post',
			headers          : {
				Authorization : `Bearer ${templateData['auth_token']}`,
				...formData.getHeaders()
			},
			maxContentLength : Infinity,
			maxBodyLength    : Infinity,
			data             : formData
		})
		loader.stop() // Stop loading indicator

		if (resp.status === 200) {
			console.log(chalk.green(`Request sent. Response => ${resp.data}`))
			return
		}
	} catch (err) {
		loader.stop() // Stop loading indicator
		throw new Error(`Problem uploading project template to blob storage...\n${err}`)
	}
}

module.exports = {
	getProjectTemplates,
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
	getNodePackageRootDir,
	uploadProjectTemplate
}
