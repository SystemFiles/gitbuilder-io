const express = require('express')
const router = express.Router()

// Controllers
const mainController = require('../controllers/mainController')

// Routes
router.get('/message', mainController.controllerFunc)

module.exports = router
