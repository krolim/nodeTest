var express = require('express');
var conf = require('./conf.json');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var separators = [',', ' и ', '-', ' ']
var input = '3 млека, 2 масла и 4 хлебчета';

app.use(express.static('public'));

app.get('/', function (req, res) {
   res.send('Hello World');
})

app.post('/test', function(req, res) {
	orderText = req.body.orderText;
	if (orderText != undefined && orderText.trim().length != 0) {
		var tokens = orderText.split(new RegExp(separators.join('|'))).filter(function(token) {
			return (token.trim().length != 0);
		}).map(function(token) {
			amount = conf.amounts[token];
			return amount ? amount : token;
		});
		var tokenTypes = tokens.map(function categorize(token) {
			var tokenType = {};
			var amount = conf.amounts[token];
			//console.log(conf.amounts); 
			if (amount || !isNaN(token)) {
				tokenType.type = "amount";
			} else {
				tokenType.type = "productName"
			}
			tokenType.val = token;
			return tokenType;
		});
		var prevOrderLine;
		var orderLines = [];
		var orderLine = {};
		tokenTypes.forEach(function(token) {
			if (token.type === "amount") {
				orderLine.amount = token.val;
			} else if (token.type === "productName") {
				orderLine.product = token.val;
			}
			if (orderLine.amount && orderLine.product) {
				orderLines.push(orderLine);
				orderLine = {}
			}
		});
		
		res.send(JSON.stringify(orderLines));	
	} else {
		res.send('No order was sent');
	}
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})