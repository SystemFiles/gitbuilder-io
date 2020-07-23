const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')

const sayTitle = (version) => {
	clear()
	console.log(chalk.blueBright(figlet.textSync('gitBuilder.io', { horizontalLayout: 'full' })))
	console.log(
		chalk.yellow(`\n{ Version: ${version} } `) +
			chalk.whiteBright(' => ') +
			chalk.cyan(' The simple git project starter')
	)
	console.log(
		chalk.gray('\n** NOTE: run') +
			chalk.bold.yellow(' "gitbuilder --reset" ') +
			chalk.gray('to unset your stored auth token(s) ** \n')
	)
}

const wrapOutput = (content) => {
	clear()
	console.log('------------------------------------------------------')
	console.log(content)
	console.log('------------------------------------------------------')
}

const showOAuthHelp = () => {
	console.log(
		'------------ [ HOW-TO: Find OAuth Token ] ------------\n1. Go to Github.com\n2. Go to your account settings\n3. Select "Developer Settings" > "Personal Tokens" > "Generate New Token"\n4. Follow the prompts to generate your token\n5. Copy your token into your terminal when gitBuilder asks for it\n------------- ------------ ------------ --------------'
	)
}

module.exports = {
	sayTitle,
	wrapOutput,
	showOAuthHelp
}
