const chalk = require('chalk')
const { Spinner } = require('clui')
const Listr = require('listr')

// Local require
const { version } = require('./package.json')
const { sayTitle } = require('./utils')
const repo = require('./lib/repo')
const inquirer = require('./lib/inquirer')
const github = require('./lib/github')

const run = async () => {
	sayTitle(version)
	// Auth with GitHub using OAuth && Gather project information
	let octokitInstance = await github.getInstance()
	let projectDetails = await inquirer.askProjectDetails()

	console.log(projectDetails)

	// Start building local repository
	let ignoreFiles = await inquirer.askGitIgnore()

	// Start building the remote repository
	console.log(chalk.bold(`\n--------- [ Starting build for ${projectDetails.project_name} ] ---------\n`))
	await new Listr([
		{
			title : 'Create remote repository',
			task  : async () => {
				projectDetails['https_url'] = await repo
					.createRemoteRepo(octokitInstance, projectDetails)
					.catch((err) => {
						throw new Error(`Problem creating remote repository. ${err}`)
					})
			}
		}
	]).run()
}

run().catch((err) => {
	console.log(chalk.red(`Uncaught Error => ${err}`))
})
