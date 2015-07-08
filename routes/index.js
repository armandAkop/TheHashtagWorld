var express = require('express');
var router = express.Router();
var HomeController = require('../controllers/home_controller');


/* GET home page. */
router.get('/', HomeController.getTweets);

module.exports = router;
