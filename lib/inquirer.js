const files = require('./files')
const inquirer = require('inquirer')

const askGithubToken = () => {
	const questions = [
		{
			name     : 'token',
			type     : 'password',
			message  : 'Enter your Github OAuth Token: ',
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'Please enter your Oauth Token.'
				}
			}
		}
	]
	return inquirer.prompt(questions)
}

const askGitIgnore = (projectName) => {
	let res = files.getFileFoldersInDir(`${files.getCurrentDirectory()}/${projectName}/`)

	const question = [
		{
			name    : 'gitignore_files',
			type    : 'checkbox',
			message : 'Select all the files/folders you wish for git to ignore: ',
			choices : res
		}
	]

	return res.length > 0 ? inquirer.prompt(question) : []
}

const askProjectDetails = () => {
	const githubFeatures = [
		{ name: 'has_issues', checked: true },
		{ name: 'has_projects', checked: true },
		{ name: 'has_wiki', checked: true }
	]
	// Supported languages
	const langChoice = [
		'python',
		'nodejs'
	]
	// Dynamically load in supported project templates
	let pythonTemplates = files.getFileFoldersInDir(`${files.getNodePackageRootDir()}/templates/projects/python/`)
	let nodejsTemplates = files.getFileFoldersInDir(`${files.getNodePackageRootDir()}/templates/projects/nodejs/`)
	const typeChoice = {
		python : pythonTemplates.map((item) => item.slice(0, -1)),
		nodejs : nodejsTemplates.map((item) => item.slice(0, -1))
	}
	const readme_styles = [
		'standard',
		'minimal',
		'hackathon',
		'bot'
	]
	const cicdProviders = [
		'travis'
	]

	const questions = [
		{
			name     : 'project_name',
			type     : 'input',
			message  : `🤔 What do you want to call this project? `,
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'Enter a valid project name.'
				}
			},
			default  : () => {
				return 'Github-Project-Repository'
			}
		},
		{
			name     : 'project_description',
			type     : 'input',
			message  : 'Enter a short description of your project',
			validate : (value) => {
				if (value.length) return true
				return 'Please enter something to describe your project.'
			},
			default  : () => 'A project made using gitBuilder.io'
		},
		{
			name    : 'project_visibility',
			type    : 'list',
			message : 'Is this a Public or Private project? ',
			choices : [
				'public',
				'private'
			]
		},
		{
			name    : 'project_homepage',
			type    : 'input',
			message : 'Enter your project homepage: ',
			default : () => 'https://example.com'
		},
		{
			name     : 'project_features',
			type     : 'checkbox',
			message  : 'Select all GitHub features you would like to use for this project: ',
			validate : function(answer) {
				if (answer.length < 1) {
					return 'You must choose at least one feature to include.'
				}

				return true
			},
			choices  : githubFeatures
		},
		{
			name    : 'project_lang',
			type    : 'list',
			message : 'What language are you planning to (primarily) use? ',
			choices : langChoice
		},
		{
			name    : 'project_type',
			type    : 'list',
			message : 'What type of project are you looking to create?',
			choices : (answers) => typeChoice[answers['project_lang']]
		},
		{
			name    : 'include_readme',
			type    : 'confirm',
			message : 'Would you like to include a README file?'
		},
		{
			name    : 'readme_style',
			type    : 'list',
			message : 'Select a style for your README: ',
			choices : readme_styles,
			when    : (answers) => answers['include_readme']
		},
		{
			name    : 'include_cicd',
			type    : 'confirm',
			message : 'Would you like to use CI/CD? '
		},
		{
			name    : 'cicd_provider',
			type    : 'list',
			message : 'What CICD Provider do you want to use? ',
			choices : cicdProviders,
			when    : (answers) => answers['include_cicd']
		}
	]

	return inquirer.prompt(questions)
}

module.exports = {
	askGithubToken,
	askProjectDetails,
	askGitIgnore
}
