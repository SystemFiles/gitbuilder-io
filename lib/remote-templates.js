const ConfigStore = require('configstore')
const fs = require('fs-extra')
const Axios = require('axios')
const anzip = require('anzip')

// CONFIG
const pkg = require('../package.json')
const conf = new ConfigStore(pkg.name)

const updateConfigStoreWithTemplate = (user, repo, ref) => {
	if (conf.has('external_templates')) {
		let currentTemplates = conf.get('external_templates')
		let selectedTemplateRepo =
			currentTemplates.length > 0 ? currentTemplates.filter((template) => template.name.includes(`${repo}`)) : []

		// If external_templates doesn't contain this repo already, add it
		if (selectedTemplateRepo.length === 0) {
			conf.set('external_templates', [
				...currentTemplates,
				{
					name : repo,
					url  : `https://github.com/${user}/${repo}?ref=${ref}`
				}
			])
		} else {
			console.log(`Storage already contains this template repo (${repo})...`)
		}
	} else {
		conf.set('external_templates', [
			{
				name : repo,
				url  : `https://github.com/${user}/${repo}?ref=${ref}`
			}
		])
	}
}

const downloadProjectZipped = async (user, repo, ref, dir) => {
	let rawRef = ref || 'master'
	let destFile = fs.createWriteStream(`${dir}/${repo}.zip`)
	let rawURL = `https://codeload.github.com/${user}/${repo}/zip/${rawRef}`

	try {
		// Perform download of requested template repository from GitHub
		let resp = await Axios({
			url          : rawURL,
			method       : 'GET',
			responseType : 'stream'
		})

		// If there were no problems with the request, pipe the data into the destination file
		if (resp.status === 200) {
			resp.data.pipe(destFile)

			return new Promise((resolve, reject) => {
				destFile.on('finish', resolve)
				destFile.on('error', reject)
			})
		} else {
			throw new Error(`Failed to make request to ${rawURL} (${resp.status})`)
		}
	} catch (err) {
		throw new Error(`Failed to download zipped template repo from the provided URL (${rawURL})... ${err}`)
	}
}

const unzipProjectArchive = async (repo, dir) => {
	try {
		// Unzip the file contents of project reposiotry
		await anzip(`${dir}/${repo}.zip`, {
			outputPath : `${dir}/`
		})
	} catch (err) {
		throw new Error(`Problem unzipping archived template...(${dir}/${ref}.zip)\n${err}`)
	}
}

const moveRepoContentsToProjectFolder = async (repo, dir) => {
	let contents = await fs.readdir(`${dir}/${repo}-master/`)

	// If contents not empty, move files to dir
	if (contents.length > 0) {
		for await (const file of contents) {
			await fs.move(`${dir}/${repo}-master/${file}`, `${dir}/${file}`)
		}

		// Now delete root directory of repo
		await fs.remove(`${dir}/${repo}-master/`)
	} else {
		throw new Error(`Contents of ${dir}/${repo}/ is empty...`)
	}
}

const getRemoteTemplate = async (user, repo, ref, dir) => {
	try {
		await downloadProjectZipped(user, repo, ref, dir)
		await unzipProjectArchive(repo, dir)
		await moveRepoContentsToProjectFolder(repo, dir)

		// Add template to list of re-useable templates (if successful)
		updateConfigStoreWithTemplate(user, repo, ref)
	} catch (err) {
		throw new Error(`Problem retrieving remote template from target GitHub repository... ${err}`)
	}
}

const parseGitHubURL = (gitURL) => {
	let userGroup = gitURL.split('/')[3]
	let ref, repo
	if (gitURL.includes('?ref=')) {
		ref = gitURL.split('?ref=')[1]
		repo = gitURL.split('/')[4].split('?ref=')[0]
	} else {
		repo = gitURL.split('/')[4]
	}

	return {
		user : userGroup,
		repo : repo,
		ref  : ref || 'master'
	}
}

module.exports = {
	getRemoteTemplate,
	parseGitHubURL
}
