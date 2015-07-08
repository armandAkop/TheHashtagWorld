var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');


/* GET home page. */
router.get('/', homeController.getTweets);

module.exports = router;
