#! /usr/bin/env node

// Load running dependencies
const chalk = require('chalk')
const Listr = require('listr')
const process = require('process')
const { program } = require('commander')

// Local require
const { version } = require('./package.json')
const { sayTitle } = require('./utils')
const repo = require('./lib/repo')
const inquirer = require('./lib/inquirer')
const github = require('./lib/github')
const files = require('./lib/files')
const command = require('./lib/command')

// Set Commandline options/flags
program.option('-r --reset', 'Reset your stored auth tokens.')
program.parse(process.argv)

// Setup main/core program
const run = async () => {
	sayTitle(version)

	// Reset stored tokens (delete)
	if (program.reset) {
		github.resetStoredTokens()
	}

	let commandList = [
		'git'
	]

	// Run check for required dependencies on the machine running this program
	await new Listr([
		{
			title : 'Check for required CLI dependencies',
			task  : async () => await command.checkCommands(commandList),
			skip  : () => false
		}
	])
		.run()
		.catch((err) => {
			throw new Error(`Error => ${err}`)
		})

	// Start application once we are sure we have all required dependencies
	sayTitle(version)
	let octokitInstance = await github.getInstance()
	let projectDetails = await inquirer.askProjectDetails()
	let remoteURL

	console.log(chalk.bold(`\n--------- [ Starting local build for ${projectDetails.project_name} ] ---------\n`))
	await new Listr(
		[
			{
				title : 'Creating local project directory (not exists)',
				task  : async () => await files.makeProjectDirectory(projectDetails.project_name),
				skip  : () => files.directoryExists(`${files.getCurrentDirectory()}/${projectDetails.project_name}/`)
			},
			{
				title : 'Initialize project as Git project',
				task  : async () => {
					projectDetails['init_resp'] = await repo.initLocalRepo(projectDetails.project_name)
				}
			},
			{
				title : 'Copy selected README template to project directory',
				task  : async () =>
					await files.copyReadmeTemplateToProjects(projectDetails.project_name, projectDetails.readme_style),
				skip  : () => !projectDetails.include_readme
			},
			{
				title : 'Copy CI/CD Configuration template from selected',
				task  : async () =>
					await files.copyCIConfigTemplate(projectDetails.project_name, projectDetails.cicd_provider),
				skip  : () => !projectDetails.include_cicd
			},
			{
				title : 'Copy project template to target project directory',
				task  : async () => {
					if (!projectDetails.use_external) {
						// Use template from remote storage API
						await files.copyProjectTemplate(
							projectDetails.project_name,
							projectDetails.project_lang,
							projectDetails.project_type
						)
					} else {
						// Using template from Github repository
						projectDetails.selected_template === 'CREATE_NEW'
							? await files.copyProjectTemplateFromRepo(
									projectDetails.project_name,
									projectDetails.new_template
								)
							: await files.copyProjectTemplateFromRepo(
									projectDetails.project_name,
									projectDetails.selected_template
								)
					}
				},
				skip  : () => !projectDetails.use_template
			}
		],
		{ concurrent: true }
	)
		.run()
		.then(() => console.log(chalk.greenBright('Successfully created local project repository!')))
		.catch((err) => {
			throw new Error(`Problem with local build...${err}`)
		})

	console.log(chalk.bold(`\n--------- [ Start .gitignore process ] ---------\n`))
	let respAskIgnore = await inquirer.askGitIgnore(projectDetails.project_name)
	await new Listr([
		{
			title : 'Create .gitignore (if none exists)',
			task  : async () =>
				files.touch(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`),
			skip  : () =>
				files.directoryExists(`${files.getProjectDirectoryIfExists(projectDetails.project_name)}/.gitignore`)
		},
		{
			title : 'Write .gitignore selections to project directory',
			task  : async () =>
				await files.writeGitIgnoreToProject(projectDetails.project_name, respAskIgnore.gitignore_files),
			skip  : () => respAskIgnore.length === 0
		}
	])
		.run()
		.catch((err) => {
			throw new Error(`Problem populating .gitignore. ${err}`)
		})

	// Start building the remote repository
	if (projectDetails.publish_remote) {
		console.log(chalk.bold(`\n--------- [ Starting remote build for ${projectDetails.project_name} ] ---------\n`))
		await new Listr([
			{
				title : 'Create remote repository',
				task  : async () => {
					remoteURL = await repo.createRemoteRepo(octokitInstance, projectDetails).catch((err) => {
						throw new Error(`Problem creating remote repository. ${err}`)
					})
				},
				skip  : () => !projectDetails.init_resp
			},
			{
				title : 'Attach local project repository to remote',
				task  : async () => await repo.attachToRemote(projectDetails.project_name, remoteURL),
				skip  : () => !projectDetails.init_resp
			},
			{
				title : 'Publish to repository with project template',
				task  : async () => await repo.publishProjectContent(projectDetails.project_name),
				skip  : () => remoteURL === null
			}
		])
			.run()
			.then(() => {
				console.log(
					chalk.greenBright('Successfully created remote repository and connected to local git project!')
				)
				let commands = []
				switch (projectDetails.project_lang) {
					case 'nodejs':
						commands = [
							'npm i'
						]
						break
					case 'python':
						commands = [
							'python3 -m venv env',
							'source env/bin/activate',
							'pip3 install -r requirements.txt'
						]
						break
					default:
						commands = [
							'NONE_SPECIFIED'
						]
						break
				}
				commands.length > 0
					? console.log(
							chalk.cyan(
								`Make sure to run the following commands in your project directory:\n- ${commands.join(
									'\n- '
								)}`
							)
						)
					: console.log('')
			})
			.catch((err) => {
				throw new Error(`Problem running remote build for repository. ${err}`)
			})

		// Return the remote URL for the user to check their remote repository
		return remoteURL
	} else {
		console.log(chalk.gray(`\nYou have selected to not publish this local repository to remote...skipping...`))
		return '[ UNPUBLISHED ]'
	}
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
		console.log(chalk.red(`Error => ${err}`))
	})
