const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')

const sayTitle = (version) => {
	clear()
	console.log(chalk.blueBright(figlet.textSync('gitBuilder.io', { horizontalLayout: 'full' })))
	console.log(
		chalk.yellow(`\n{ Version: ${version} } `) +
			chalk.whiteBright(' => ') +
			chalk.cyan(' The simple git project starter\n')
	)
}

const wrapOutput = (content) => {
	clear()
	console.log('------------------------------------------------------')
	console.log(content)
	console.log('------------------------------------------------------')
}

module.exports = {
	sayTitle,
	wrapOutput
}
