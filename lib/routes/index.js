var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');


/* GET home page. */
router.get('/', function(req, res) {
	res.send("<h2>Out to lunch, be back soon.</h2>");
});
router.get('/tweets', homeController.getTweets);

module.exports = router;
