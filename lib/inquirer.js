const files = require('./files')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const ConfigStore = require('configstore')

// CONFIG
const pkg = require('../package.json')
const conf = new ConfigStore(pkg.name)

const askLoginMethod = () => {
	const query = [
		{
			name    : 'login_method',
			type    : 'list',
			message : 'Select a login method (NOTE: Basic Login is deprecated and will be removed soon!): ',
			choices : [
				'Basic Login',
				'OAuth Token'
			]
		}
	]

	return inquirer.prompt(query)
}

const askTwoFactorCode = () => {
	const code = [
		{
			name     : 'security_code',
			type     : 'input',
			message  : 'Enter your 2FA security code: ',
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'You must enter a valid 2FA security code.'
				}
			}
		}
	]

	return inquirer.prompt(code)
}

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

const askGitHubLogin = () => {
	const credentialQuery = [
		{
			name     : 'username',
			type     : 'input',
			message  : 'Enter your Github username: ',
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'Please enter your username or email for Github.'
				}
			}
		},
		{
			name     : 'password',
			type     : 'password',
			message  : 'Enter your password [Secure]: ',
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'Please enter something for your password'
				}
			}
		}
	]

	return inquirer.prompt(credentialQuery)
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
	let pythonTemplates = files.getProjectTemplates(langChoice[langChoice.indexOf('python')])
	let nodejsTemplates = files.getProjectTemplates(langChoice[langChoice.indexOf('nodejs')])
	const typeChoice = {
		python : pythonTemplates,
		nodejs : nodejsTemplates
	}

	// Load any stored templates from external repos
	const externalTemplates = [
		{ name: 'Import a new template from a repo...', value: 'CREATE_NEW' }
	]
	if (conf.has('external_templates')) {
		conf.get('external_templates').forEach((template) => {
			externalTemplates.push({ name: template.name, value: template.url })
		})
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
			message  : 'Enter a short description of your project: ',
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
			name     : 'project_homepage',
			type     : 'input',
			message  : 'Enter your project homepage: ',
			default  : () => 'https://example.com',
			validate : (value) => {
				if (value.length) {
					return true
				} else {
					return 'Please enter a valid url.'
				}
			}
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
			name    : 'use_template',
			type    : 'confirm',
			message : 'Would you like to use a pre-defined template to bootstrap your project? '
		},
		{
			name    : 'use_external',
			type    : 'confirm',
			message : 'Use an external template from Github reposiotry? ',
			when    : (answers) => answers['use_template']
		},
		{
			name    : 'selected_template',
			type    : 'list',
			message : 'Select which stored template repository you wish to use (or import a new one): ',
			choices : externalTemplates,
			when    : (answers) => answers['use_template'] && answers['use_external']
		},
		{
			name     : 'new_template',
			type     : 'input',
			message  : 'Enter the Github URL you wish to template into your project: ',
			default  : () => 'https://github.com/seanfisk/python-project-template',
			validate : (value) => {
				let gitUrlRegex = /(\w+:\/\/)(github.com+)(:[\d]+){0,1}\/*(.*)/g
				if (value.length && value.match(gitUrlRegex) !== null) {
					return true
				} else {
					return 'Please enter a valid github project path...'
				}
			},
			when     : (answers) =>
				answers['use_template'] && answers['use_external'] && answers['selected_template'] === 'CREATE_NEW'
		},
		{
			name    : 'project_lang',
			type    : 'list',
			message : 'What project language are you planning to use (primarily)? ',
			choices : langChoice,
			when    : (answers) => answers['use_template'] && !answers['use_external']
		},
		{
			name    : 'project_type',
			type    : 'list',
			message : 'What type of project are you looking to create? ',
			choices : (answers) => typeChoice[answers['project_lang']],
			when    : (answers) => answers['use_template'] && !answers['use_external']
		},
		{
			name    : 'include_readme',
			type    : 'confirm',
			message : 'Would you like to include a README file? '
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
		},
		{
			name    : 'publish_remote',
			type    : 'confirm',
			message : 'Would you like to publish this project automatically to your remote git repository? '
		}
	]

	return inquirer.prompt(questions)
}

const askUploadTemplateData = () => {
	const query = [
		{
			name     : 'auth_token',
			type     : 'password',
			message  : 'Please enter your provided OAuth2.0 token [SECURE]: ',
			validate : (value) => {
				if (value.length) {
					return true
				}
				return 'Please enter a valid OAuth2.0 token...'
			}
		},
		{
			name     : 'upload_path',
			type     : 'input',
			message  : 'Enter the path to your zipped project template: ',
			validate : (value) => {
				let realPath
				if (value.length) realPath = fs.realpathSync(value)
				else return 'Please enter a path to the zipped template...'
				if (fs.pathExistsSync(realPath) && realPath.endsWith('.zip')) {
					return true
				}
				return 'PATH INVALID: Please enter a valid (existing) path to the zipped (.zip) template'
			},
			default  : () => './express-js.zip'
		},
		{
			name    : 'upload_lang',
			type    : 'list',
			message : 'Select project language category: ',
			choices : [
				'python',
				'nodejs'
			]
		}
	]

	return inquirer.prompt(query)
}

module.exports = {
	askGithubToken,
	askGitHubLogin,
	askTwoFactorCode,
	askLoginMethod,
	askProjectDetails,
	askGitIgnore,
	askUploadTemplateData
}
