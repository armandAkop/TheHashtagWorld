'use strict';

var Twitter = require('twitter');
var app = require('express')();
var path = require('path');
var credentialsConfig = require(path.join(__dirname, '../../config/credentials', app.get('env') + '.json'));

var getTweets = function(req, res, callback) {

	res.render('index');
	
}

exports.getTweets = getTweets;