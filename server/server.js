var express = require('express'),
	twitter = require('ntwitter'),
	mongo = require('mongodb'),
	http = require('http'),
	fs = require('fs'),
	app = express(),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	host="127.0.0.1",
	dbport=mongo.Connection.DEFAULT_PORT;
	var port = process.env.PORT || 3000;
	
server.listen(port, function() {
	console.log("Listening on " + port);
});

//DATABASE MONGODB
//DB holds an object of the form {_id: 'date string, 'date': dateObject, count: [array 24]}
//On each tweet find the count and insert or update
var MongoClient = require('mongodb').MongoClient;
var dummyDate = new Date(1988, 05, 16, 0, 0, 0, 0);
var counts; /*collection name to be used while querying the DB*/

//Connecting to DB
MongoClient.connect('mongodb://127.0.0.1:27017/tweetCount', function(err, db) {
	if(!err) console.log('we are connected');
	counts = db.collection('countPerDay');

	//Dummy insert to make the DB active
	counts.save({ "_id" : "dummy", 
					date: dummyDate, 
					count: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
				}, 
				function (err, inserted) {});
});





//APP LOGIC
//Connect to twitter
var twitter = require('ntwitter');

var twit = new twitter({
  //Fill in these values before starting the application
  consumer_key: 'V9LlcrBnYkN2aNNEcPZIug',
  consumer_secret: 'FOeCACbdZU6b8dAhvwdgEXSdeKTLe9zDka1gfzmexs',
  access_token_key: '2225748734-gnp0YdhaulqOTspywdVLuaYtmGGQHpmenmQ68nD',
  access_token_secret: 'DruG5AOQXmHGBYov7ArhkeAfXkIwM7NI4DLFynZenOJez'
});




//There are two graphs, one real time, another pulling data from Mongo

//For real time, I am keeping all the logic in client side, In the server just on each tweet,
//I am sending the tweet to the client (client will take care of counting the tweets per second or whatever)

//For Mongo graph the right kind of data should be stored in the DB 

twit.stream('statuses/sample', function(stream) {
//On receiving data(one tweet object) from twitter
	stream.on('data', function (data) {
	  	//Part 1 - real time graph is implemented completely in client side

	  	//Part 3 - Tweet Ticker
	  	//Check if there are hashtags in the tweet, if not set tag == ''
	  	if(data.entities.hashtags[0] != null || data.entities.hashtags[0] != undefined ) 
	      var tag = data.entities.hashtags[0].text;
	    else
	      var tag = '';    
	   
	    //parse only the required information , open socket and form a streaming connection with the client 
		io.sockets.volatile.emit('tweet', {
			user: data.user.screen_name,
			dp: data.user.profile_image_url,
			text: data.text,
			hashtag: tag   
		});          

		//Part 2 - Graph - tweets per day
		//converts the twitter created_at attribute to JS date object
		var createdAt = parseTwitterDate(data.created_at); 
		var tweetDate = createdAt.toDateString();
		var tweetHour = createdAt.getHours();

		var countObject = { "_id" : tweetDate, 
							date: createdAt, 
							count: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
					    };
		//The code below is the logic for saving tweet count per hour for every day
		counts.find({"_id": tweetDate}).toArray(function(err, docs){
			if(docs.length == 0){
				countObject.count[tweetHour]++;
				counts.save(countObject, function (err, inserted) {});
				//reset countObject
				countObject = { "_id" : tweetDate, 
							date: createdAt, 
							count: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
					    };
			}
			else{
				countObject = docs[0];
				countObject.count[tweetHour]++;
				counts.save(countObject, function (err, inserted) {});
				//reset countObject
				countObject = { "_id" : tweetDate, 
							date: createdAt, 
							count: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
					    };
			}
		});
	});
});


//Functions

//convert twitter created_at to Javascript Date object
function parseTwitterDate(text) {
	return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
}


//ROUTERS
//The API part

//List of all dates(as an array) available in the database to be shown in the selector (dropdown)
//read about 'javascript array.push() and forEach() methods'
// step2
app.get('/getAllDates',function (req, res) {
	var allDates = [];
	counts.find().toArray(function(err, docs){
		//for each count doc, push the date into the array
		docs.forEach(function(doc) {
			//i don't want the dummy date
			if(doc._id != "dummy")
            	allDates.push(doc._id);
          });
		//send the array as a json response
		res.json(allDates);
	}); 
});

//Count for a prticular date from selector
//step 3
app.get('/getCountForDate/:date',function (req, res) {
	var selectedDate = decodeURI(req.params.date);
	var countForDate;
	counts.find({"_id": selectedDate}).toArray(function(err, docs){
		//if there is only the dummy count
		if (docs.length == 0){
			countForDate = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		}
		//else get the penultimate count object
		else{
			countForDate = docs[0];
		}
		res.json(countForDate);
	});    
});

//Default count - count from previous day
app.get('/getDefaultCount',function (req, res) {
	var defaultCount;
	counts.find().toArray(function(err, docs){
		//if there is only the dummy count
		if (docs.length == 1){
			defaultCount = docs[0];
		}
		//else get the penultimate count object
		else{
			defaultCount = docs[docs.length - 2];
		}
		res.json(defaultCount);
	});    
});


//Routing the files

app.get('/',function(req,res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/css/:filename',function(req,res){
	var filename = req.params.filename;
	res.sendfile(__dirname + '/css/' + filename);
});

app.get('/js/:jsname',function(req,res){
	var jsname = req.params.jsname;
	res.sendfile(__dirname + '/js/' + jsname);
});
