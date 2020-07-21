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
	let remoteURL = ''

	// Start building local repository
	if (!files.directoryExists(`${files.getCurrentDirectory()}/${projectDetails.project_name}`)) {
		await files.makeProjectDirectory(projectDetails.project_name)
	}
	let respAskIgnore = await inquirer.askGitIgnore(projectDetails.project_name)
	if (!files.directoryExists(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`)) {
		files.touch(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`)
	}

	console.log(chalk.bold(`\n--------- [ Starting local build for ${projectDetails.project_name} ] ---------\n`))
	await new Listr(
		[
			{
				title : 'Write .gitignore to project directory',
				task  : async () =>
					await files.writeGitIgnoreToProject(projectDetails.project_name, respAskIgnore.gitignore_files),
				skip  : () => respAskIgnore.length === 0
			},
			{
				title : 'Copy selected README template to project directory',
				task  : async () =>
					await files.copyReadmeTemplateToProjects(projectDetails.project_name, projectDetails.readme_style),
				skip  : () => !projectDetails.include_readme
			},
			{
				title : 'Copy project structure template',
				task  : async () => await files.copyProjectTemplate(),
				skip  : () => true
			},
			{
				title : 'Initialize project as Git project',
				task  : async () => {
					projectDetails['init_resp'] = await repo.initLocalRepo(projectDetails.project_name)
				}
			}
		],
		{ concurrent: true }
	)
		.run()
		.then(() => console.log(chalk.greenBright('Successfully created local project repository!')))
		.catch((err) => console.log(chalk.red(`Problem with local build...${err}`)))

	// Start building the remote repository
	console.log(chalk.bold(`\n--------- [ Starting remote build for ${projectDetails.project_name} ] ---------\n`))
	await new Listr([
		{
			title : 'Create remote repository',
			task  : async () => {
				remoteURL = await repo.createRemoteRepo(octokitInstance, projectDetails).catch((err) => {
					throw new Error(`Problem creating remote repository. ${err}`)
				})
			},
			skip  : () => true
		},
		{
			title : 'Attach local project repository to remote',
			task  : async () => await repo.attachToRemote(projectDetails.project_name, remoteURL),
			// skip  : () => projectDetails.init_resp === null
			skip  : () => true
		},
		{
			title : 'Publish to repository with project template',
			task  : async () => await repo.publishProjectContent(projectDetails.project_name),
			// skip  : () => remoteURL === null
			skip  : () => true
		}
	])
		.run()
		.then(() =>
			console.log(chalk.greenBright('Successfully created remote repository and connected to local git project!'))
		)

	return remoteURL
}

run()
	.then((remoteURL) => {
		console.log(
			chalk.cyanBright(
				`Project has been created successfully! It is available on Github at ${chalk.yellow(remoteURL)}`
			)
		)
	})
	.catch((err) => {
		console.log(chalk.red(`Uncaught Error => ${err}`))
	})
