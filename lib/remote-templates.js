const ConfigStore = require('configstore')
const fs = require('fs-extra')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const cwd = process.cwd
const unzipper = require('unzipper')
const anzip = require('anzip')

// CONFIG
const pkg = require('../package.json')
const conf = new ConfigStore(pkg.name)

const updateConfigStoreWithTemplate = (repo) => {
	if (conf.has('external_templates')) {
		let currentTemplates = conf.get('external_templates')

		// If external_templates doesn't contain this repo already, add it
		if (!currentTemplates.includes(repo)) {
			conf.set('external_templates', [
				...currentTemplates,
				repo
			])
		} else {
			console.log(`Storage already contains this template repo (${repo})...`)
		}
	} else {
		conf.set('external_templates', [
			repo
		])
	}
}

const downloadZip = async (user, repo, ref, dir) => {
	let rawRef = ref || 'master'
	let rawURL = `https://github.com/${user}/${repo}/archive/${rawRef}.zip`

	try {
		await exec(`curl -LOs ${rawURL} -o ${dir} > /dev/null`)
	} catch (err) {
		throw new Error(`Error occured trying to download zipped project... ${err}`)
	}
}

const unzipProjectArchive = async (ref, dir) => {
	try {
		// Unzip the file contents of project reposiotry
		await anzip(`${dir}/${ref}.zip`)

		// Delete zip after extraction
		await fs.remove(`${dir}/${ref}.zip`)
	} catch (err) {
		throw new Error(`Problem unzipping archived template...(${dir}/${ref}.zip)\n${err}`)
	}
}

const moveRepoContentsToProjectFolder = async (repo, dir) => {
	let contents = await fs.readdir(`${dir}/${repo}-master/`)

	// If contents not empty, move files to dir
	if (contents.length > 0) {
		for await (const file of contents) {
			fs.move(`${dir}/${repo}-master/${file}`, `${dir}/${file}`)
		}

		// Now delete root directory of repo
		await fs.remove(`${dir}/${repo}-master/`)
	} else {
		throw new Error(`Contents of ${dir}/${repo}/ is empty...`)
	}
}

const getRemoteTemplate = async (user, repo, ref, dir) => {
	try {
		await downloadZip(user, repo, ref, dir)
		await unzipProjectArchive(ref, dir)
		await moveRepoContentsToProjectFolder(repo, dir)

		// Add template to list of re-useable templates (if successful)
		updateConfigStoreWithTemplate(repo)
	} catch (err) {
		throw new Error(`Problem retrieving remote template from target GitHub repository... ${err}`)
	}
}

const parseGitHubURL = (gitURL) => {
	let userGroup = gitURL.split('/')[3]
	let ref
	let repo
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
