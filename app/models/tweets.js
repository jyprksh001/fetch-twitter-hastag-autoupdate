var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tweetSchema = new Schema({	
	data:{type:{},index:{unique:true}}
});

module.exports = mongoose.model('tweet', tweetSchema);
