const chalk = require('chalk')
const Listr = require('listr')

// Local require
const { version } = require('./package.json')
const { sayTitle } = require('./utils')
const repo = require('./lib/repo')
const inquirer = require('./lib/inquirer')
const github = require('./lib/github')
const files = require('./lib/files')

const run = async () => {
	sayTitle(version)
	// Auth with GitHub using OAuth && Gather project information
	let octokitInstance = await github.getInstance()
	let projectDetails = await inquirer.askProjectDetails()

	// Start building local repository
	if (!files.directoryExists(`${files.getCurrentDirectory()}/${projectDetails.project_name}`)) {
		await files.makeProjectDirectory(projectDetails.project_name)
	}
	let respAskIgnore = await inquirer.askGitIgnore(projectDetails.project_name)
	if (!files.directoryExists(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`)) {
		files.touch(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`)
	}
	await files.writeGitIgnoreToProject(projectDetails.project_name, respAskIgnore.gitignore_files)

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
