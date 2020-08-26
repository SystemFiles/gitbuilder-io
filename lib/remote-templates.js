const ConfigStore = require('configstore')
const fs = require('fs-extra')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const cwd = process.cwd
const AdmZip = require('adm-zip')

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

const unzipProjectArchive = async (ref, dir, overwrite) => {
	try {
		let zip = new AdmZip(`${dir}/${ref}.zip`)
		zip.extractAllTo(`${dir}`, overwrite)

		// Delete zip after extraction
		await fs.remove(`${dir}/${ref}.zip`)
	} catch (err) {
		throw new Error(`Problem unzipping archived template...(${dir}/${ref}.zip)`)
	}
}

const moveRepoContentsToProjectFolder = async (repo, dir) => {
	let contents = await fs.readdir(`${dir}/${repo}-master/`)

	// If contents not empty
	if (contents.length > 0) {
		for await (const file of contents) {
			console.log(`Item: ${file}`)
			fs.move(file, `${dir}`)
		}
	} else {
		throw new Error(`Contents of ${dir}/${repo}/ is empty...`)
	}
}

const getRemoteTemplate = async (user, repo, ref, dir) => {
	try {
		await downloadZip(user, repo, ref, dir)
		await unzipProjectArchive(ref, dir, false)
		await moveRepoContentsToProjectFolder(repo, dir)

		// Add template to list of re-useable templates (if successful)
		updateConfigStoreWithTemplate(repo)
	} catch (err) {
		throw new Error(`Problem retrieving remote template from target GitHub repository... ${err}`)
	}
}
// Test
;(async () => {
	await getRemoteTemplate('GitBuilder-io', 'template-create-react-app', 'master', cwd().toString())
})()
