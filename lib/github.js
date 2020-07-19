const { Spinner } = require('clui')
const ConfigStore = require('configstore')
const { Octokit } = require('@octokit/rest')
const { createTokenAuth } = require('@octokit/auth-token')

// Local require & setup
const inquierer = require('./inquirer')
const pkg = require('../package.json')
const conf = new ConfigStore(pkg.name)

const getInstance = async () => {
	let token = getStoredGithubToken()
	if (!token) {
		token = await authenticateWithGithub()
	}
	return new Octokit({ auth: token })
}

const getStoredGithubToken = () => {
	return conf.get('github.token')
}

const authenticateWithGithub = async () => {
	const credentials = await inquierer.askGithubToken()
	const status = new Spinner('Authenticating you with Github, please wait...')

	status.start()

	const auth = createTokenAuth(credentials.token)
	try {
		const res = await auth().catch((err) => {
			status.stop()
			throw new Error(`Problem sending OAuth token to auth endpoint...\n${err}`)
		})

		if (res.token) {
			conf.set('github.token', res.token)
			return res.token
		} else {
			status.stop()
			throw new Error('Github token was not found in response...')
		}
	} finally {
		status.stop()
	}
}

module.exports = {
	getInstance
}
