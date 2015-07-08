var Twitter = require('twitter');

var getTweets = function(req, res, callback) {
	var client = new Twitter({
		consumer_key: 'X0K6RXLRFHVs0J33oMibgSjA0',
		consumer_secret: 'J4hLn9c61wOA1rvn0aFWn9OEAuZ8lu5SW63KRAp0ya9quEX3xh',
		access_token_key: '2930232644-8JcUtY0bt8Ztzn9XaNYzOnWffppXdPUmGH6p1C7',
		access_token_secret: 'Hn7zKQkdjSZ2q63TxXVr9xONoN1skxW3Ib2kzvswbf8dF'
	});

	var params = {screen_name: 'nodejs'};

	//client.get('statuses/user_timeline', params, function(error, tweets, response) {
	//	if (error) {
	//		next(error);
	//	} else {
			res.render('index', { title: "The Hash Tag World"});
	//	}
	//});
	
}

exports.getTweets = getTweets;