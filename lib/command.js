var commandExists = require('command-exists')

const checkCommands = async (commandList) => {
	for (let i = 0; i < commandList.length; i++) {
		const cmd = commandList[i]
		try {
			let res = await commandExists(cmd)
		} catch (err) {
			throw new Error(`Failed to load required dependencies. (Could not find ${cmd} in PATH)`)
		}
	}
}

module.exports = {
	checkCommands
}
