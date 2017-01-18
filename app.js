var express = require('express');
var app=express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./mongo');

mongoose.connect(config.database, function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to the database');
	}
}); 
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var api = require('./app/routes/api')(app,express,io);
app.use('/api', api);

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/public/app/index.html');
});

server.listen(3000);