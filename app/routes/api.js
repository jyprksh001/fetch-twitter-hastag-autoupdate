var config=require('../../config');
var request=require('request');
var urlencode = require('urlencode');
var cron=require('node-cron')
var tweets=require('../models/tweets');
function base64Maker(){
	return new Buffer(config.consumer_key+':'+config.consumer_secret).toString('base64')
}

//console.log(base64Maker())

module.exports=function(app, express,io){
	var api=express.Router();
	api.use(function(req,res,next){
		request.post({url:'https://api.twitter.com/oauth2/token',headers:{Authorization:'Basic '+base64Maker(),'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},form:{grant_type:'client_credentials'}}, function(err,httpResponse,body){ 
			if(err){
				res.json(err)
			}else{
				//we can even speed up here by saving token to redis or db
				req.body=body;
				//console.log(req.body)
				next()
			}
		})
	})

	api.get('/',function(req,res){
		//res.json(req.body)
		if(req.query.q){
			//var url='https://api.twitter.com/1.1/search/tweets.json?q='+req.query.q;
			var url='https://api.twitter.com/1.1/search/tweets.json?q='+urlencode('#'+req.query.q)
			// console.log()
			// console.log('}}'+req.body);
			var update_url,max_id_str;
			var task = cron.schedule('* * * * *', function() {
				if(max_id_str==undefined||max_id_str!=update_url.search_metadata.max_id_str){
					var url='https://api.twitter.com/1.1/search/tweets.json'+update_url.search_metadata.refresh_url;
					console.log(url);
					max_id_str=update_url.search_metadata.max_id_str;
					request.get({url:url,headers:{Authorization:'Bearer '+JSON.parse(req.body).access_token}},function(err,httpResponse,body){
						if(err){
							io.emit('err',err);
						}else if(body && body.errors){
							io.emit('error',body.errors);
						}else{
							console.log(body);
							update_url=JSON.parse(body);
							var data_arr=update_url.statuses;
							tweets.insertMany(data_arr, {upsert:true}, function(error, tweets) {
								if(!err){
									io.emit('new',body);
								}
							});
						}
					})
				}else if(max_id_str&& max_id_str==update_url.search_metadata.max_id_str){
					io.emit('updated');
				}
			}, false);
			task.stop()
			
			//console.log(JSON.parse(req.body))
			request.get({url:url,headers:{Authorization:'Bearer '+JSON.parse(req.body).access_token}}, function(err,httpResponse,body){ 
				if(err){
					res.json(err)
				}else if (body && body.errors){
						res.json(body.errors);
				}else{
						task.start()
						update_url=JSON.parse(body);
						var data_arr=update_url.statuses
						tweets.collection.insert(data_arr, {upsert:true},function(error, tweet) {
							if(!err){
								console.log(tweet)
								res.json(body);
							}else{
								res.json(error)
							}	
						});
						
				}
			})
		}else{
			res.json({message:'query params missing'})
		}


		
	})
	return api
}