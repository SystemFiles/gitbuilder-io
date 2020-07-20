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

	await new Listr(
		[
			{
				title : 'Write .gitignore to project directory',
				task  : async () =>
					await files
						.writeGitIgnoreToProject(projectDetails.project_name, respAskIgnore.gitignore_files)
						.catch((err) => {
							throw new Error(`Problem writing .gitignore to project. ${err}`)
						})
			},
			{
				title : 'Copy selected README template to project directory',
				task  : async () =>
					await files.copyReadmeTemplateToProjects(projectDetails.project_name, projectDetails.readme_style),
				skip  : () => projectDetails.include_readme
			},
			{
				title : 'Copy project structure template',
				task  : async () => await files.copyProjectTemplate(),
				skip  : () => true
			},
			{
				title : 'Initialize project as Git project',
				task  : async () => await repo.createLocalRepo(),
				skip  : () => true
			}
		],
		{ concurrent: true }
	)
		.run()
		.then(() => console.log(chalk.greenBright('Successfully created local project repository!')))

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
			},
			skip  : () => true
		},
		{
			title : 'Attach local project repository to remote',
			task  : async () => {
				await repo.attachToRemote(projectDetails.https_url).catch((err) => {
					throw new Error(`Problem attaching local repository to remote. ${err}`)
				})
			},
			skip  : () => true
		}
	])
		.run()
		.then(() =>
			console.log(chalk.greenBright('Successfully created remote repository and connected to local git project!'))
		)

	return projectDetails.https_url
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
