const fs = require('fs')
const git = require('simple-git/promise')()
const touch = require('touch')

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

const createLocalRepo = async () => {}

module.exports = {
	createRemoteRepo,
	createLocalRepo
}
