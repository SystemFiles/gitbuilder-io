const fs = require('fs-extra')
const { option } = require('commander')
const files = require('./files')
const simpleGit = require('simple-git')

const createRemoteRepo = async (githubOctokitInstance, projectDetails) => {
	let github = githubOctokitInstance
	let repoData = {
		name         : projectDetails.project_name,
		description  : projectDetails.project_description,
		private      : projectDetails.project_visibility === 'private',
		has_issues   : projectDetails.project_features.includes('has_issues'),
		has_projects : projectDetails.project_features.includes('has_projects'),
		has_wiki     : projectDetails.project_features.includes('has_wiki')
	}

	try {
		const resp = await github.repos.createForAuthenticatedUser(repoData)
		return resp.data.https_url
	} catch (err) {
		throw new Error(err)
	}
}

const getSimpleGitInstance = (projectName) => {
	let simpleGitOptions = {
		baseDir                : files.getProjectDirectoryIfExists(projectName),
		binary                 : 'git',
		maxConcurrentProcesses : 6
	}
	return new simpleGit(simpleGitOptions)
}

const initLocalRepo = async (projectName) => {
	let git = getSimpleGitInstance(projectName)

	try {
		const response = await git.init()
		return response
	} catch (err) {
		throw new Error(err)
	}
}

const attachToRemote = async (projectName, remoteSource) => {
	let git = getSimpleGitInstance(projectName)

	try {
		await git.addRemote('origin', remoteSource)
		return true
	} catch (err) {
		throw new Error(`Problem trying to attach local to remote. ${err}`)
	}
}

const publishProjectContent = async (projectName) => {}

module.exports = {
	createRemoteRepo,
	initLocalRepo,
	attachToRemote,
	publishProjectContent
}
