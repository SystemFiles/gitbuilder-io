const { Spinner } = require('clui')
const ConfigStore = require('configstore')
const { Octokit } = require('@octokit/rest')
const { createBasicAuth } = require('@octokit/auth')
const { createTokenAuth } = require('@octokit/auth-token')

// Local require & setup
const inquierer = require('./inquirer')
const pkg = require('../package.json')
const { showOAuthHelp } = require('../utils/index')
const conf = new ConfigStore(pkg.name)

const getInstance = async () => {
	let token = getStoredGithubToken()
	if (!token) {
		token = await authenticateWithGithub()
	}
	return new Octokit({ auth: token })
}

const resetStoredTokens = () => {
	conf.clear()
	return true
}

const getStoredGithubToken = () => {
	return conf.get('github.token')
}

const authenticateWithOAuth = async (credentials) => {
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
			throw new Error('No GitHub token was returned with response to Auth...')
		}
	} catch (err) {
		throw new Error('Invalid OAuth/Personal access token entered. Please try again.')
	} finally {
		status.stop()
	}
}

const authenticateWithBasicLogin = async (credentials) => {
	const status = new Spinner(`Performing login to ${credentials.username}...`)
	status.start()

	const auth = createBasicAuth({
		username : credentials.username,
		password : credentials.password,
		async on2Fa() {
			status.stop()
			let res = await inquierer.askTwoFactorCode()

			status.start()
			return res.security_code
		},
		token    : {
			scopes : [
				'user',
				'public_repo',
				'repo',
				'repo:status'
			],
			note   : 'gitBuilder.io, The simple project builder for Git.'
		}
	})

	try {
		const res = await auth()

		if (res.token) {
			conf.set('github.token', res.token)
			return res.token
		} else {
			throw new Error('No GitHub token was returned with response to Auth...')
		}
	} finally {
		status.stop()
	}
}

const authenticateWithGithub = async () => {
	let methodQuery = await inquierer.askLoginMethod()
	let token

	if (methodQuery.login_method === 'Basic Login') {
		const credentials = await inquierer.askGitHubLogin()
		token = await authenticateWithBasicLogin(credentials)
	} else {
		showOAuthHelp()
		const credentials = await inquierer.askGithubToken()
		token = await authenticateWithOAuth(credentials)
	}

	return token
}

module.exports = {
	getInstance,
	resetStoredTokens
}
