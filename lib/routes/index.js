var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');


/* GET home page. */
router.get('/', homeController.index)
router.get('/tweets', homeController.getTweets);
router.get('/robots.txt', function(req, res, next) {
	res.type('text/plain');
	res.send("User-agent: *\nAllow: /");
});

module.exports = router;
