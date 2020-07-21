// mainController.js
const { messageBuild } = require('../services/mainService')

const controllerFunc = async (req, res, next) => {
  const { message } = req.body

  res.status(200).send(messageBuild(message))
  next()
}

module.exports = {
  controllerFunc
}
