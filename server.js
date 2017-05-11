// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs 			   = require('file-system');
var archiver 	   = require('archiver');
var uuid 		   = require("uuid/v1")
var mysql          = require('mysql');
// configuration ===========================================
	
var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : '123123',
   database : 'qrCode'
 });



/*connection.query('SELECT * from qrImageTable', function(err, rows, fields) {
   if (!err)
     console.log('The solution is: ', rows);
   else
     console.log('Error while performing Query.' + err);
 });
 */
 /*var sql = "INSERT INTO qrImageTable (image_title, image_description, image_pgno) values ('Grade1SubjectSciencePgno13', 'desc1', 'pg13')";
  connection.query(sql, function (err, result) {
    if (err){
    	console.log("Error " + err);
    }
    console.log("1 record inserted" + JSON.stringify(result));
  });
 */
// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users


//GET POST request handling
app.post('/saveImage',function(req, resp){
	console.log("image image_title= " + req.body.image_title);

	var base64Data = req.body.image;//.replace(/^data:image\/png;base64,/, "");
	var data = base64Data.replace(/^data:image\/\w+;base64,/, "");
	var buf = new Buffer(data, 'base64');
	fs.writeFile('public/img/' + req.body.image_title + '.png', buf);
	// Saving the image in database
	//var sql = "UPDATE qrImageTable SET image = " + data + "where image_id = " req.body.image_id;
	connection.query('UPDATE qrImageTable SET ? WHERE ?', [{ image: buf }, { image_id: req.body.image_id }], function(err){
		if(err){
			console.log("Error occured while saving image in db" + err);
		} else{
			resp.send("Hello");
		}
	});
});



app.post('/addToDatabase',function(req, resp){
	var dataObject = req.body;
	
	var sql = "INSERT INTO qrImageTable (image_title, image_description, image_pgno) values ('" + dataObject.image_title + "','" + dataObject.image_description + "','" + dataObject.image_pgno + "')";
	console.log("SQL::" + sql);

	connection.query(sql, function (err, result) {
	    if (err){
	    	console.log("Error " + err);
	    	resp.status(400).send({data: err});
	    	return;
	    } else{
	    	console.log("1 record inserted" + JSON.stringify(result));	
			connection.query("SELECT * from qrImageTable where image_title = '" + dataObject.image_title + "'", function(err, rows, fields) {
			   	if (!err){
			    	console.log('The solution is: ', rows);
			    	resp.send(rows);
			   	}
			    else{
			     	console.log('Error while performing Query.' + err);
			     	resp.status(400).send({data: err});
			    }
			   
			});
	    }
	});
	
});

app.get('/showQRCodes', function(req, resp){
	connection.query("SELECT * from qrImageTable", function(err, rows, fields) {
	   	if (!err){
	    	console.log('The solution is: ', rows);
	    	for(var i=0; i < rows.length; i++){
	    		//bufferBase64 += new Buffer( rows[i].image, 'binary' ).toString('base64');
	    		console.log("title::" + rows[i].image_title)
	    		fs.writeFile('public/img/' + rows[i].image_title + '.png', rows[i].image);
	    		if(rows[i].image){
	    			rows[i].path = '../img/' + rows[i].image_title + '.png';
	    			rows[i].image = "";
	    		} else {
	    			rows[i].path = "null";
	    		}
	    	}
	    	resp.send(JSON.stringify(rows));
	    	console.log(rows);
	   	}
	    else{
	     	console.log('Error while performing Query.' + err);
	     	resp.status(400).send({data: err});
	    }
	   
	});
});


app.get('/getImageDetails', function(req, resp){
	console.log("query" + JSON.stringify(req.query));
	console.log("params" + JSON.stringify(req.params));
	var dataObject = req.query;
	console.log("Image title ::" + dataObject.image_title);
	var sql = "SELECT * from qrImageTable where image_title='" + dataObject.image_title + "'";
	connection.query(sql, function(err, rows, fields) {
	   	if (!err){
	    	console.log('The solution is: ', rows);
	    	for(var i=0; i < rows.length; i++){
	    		fs.writeFile('public/img/' + rows[i].image_title + '.png', rows[i].image);
	    		if(rows[i].image){
	    			rows[i].path = '../img/' + rows[i].image_title + '.png';
	    			rows[i].image = "";
	    		} else {
	    			rows[i].path = "null";
	    		}
	    	}
	    	resp.send(JSON.stringify(rows));
	    	console.log(rows);
	   	}
	    else{
	     	console.log('Error while performing Query.' + err);
	     	resp.status(400).send({data: err});
	    }
	   
	});
});

var getStream = function(fileName){
	return fs.readFileSync(fileName);
}

app.get('/downloadImages', function(req, resp){
	var dataObject = req.query;
	console.log("Image title ::" + dataObject.filterData);
	if(dataObject.filterData == 'undefined' || dataObject.filterData == undefined){
		dataObject.filterData = '';
	}
	var sql = "SELECT * from qrImageTable where image_title LIKE '%" + dataObject.filterData + "%'";
	console.log("Query::" + sql);
	var fileNames = [];
	connection.query(sql, function(err, rows, fields) {
	   	if (!err){
	    	console.log('The solution is: ', rows);
	    	for(var i=0; i < rows.length; i++){
	    		
	    		if(rows[i].image){
	    			rows[i].path = rows[i].image_title + '.png';
	    			rows[i].image = "";
	    			fileNames.push(rows[i].path);
	    		} else {
	    			rows[i].path = "null";
	    		}
	    	}
	    	var downloadName = 'Download' + uuid() + '.zip';
	    	console.log("Dwl Name:: " + downloadName);
	    	var archive  	   = archiver('zip');
	    	var output = fs.createWriteStream(__dirname + '/public/' + downloadName);
	    	archive.pipe(output);
	    	for(i=0; i<fileNames.length; i++){
				var path = __dirname + '/public/img/'+fileNames[i];
				console.log("path::" + path);
				archive.append(getStream(path), { name: fileNames[i]});
			}
			/*archive.finalize(function(err, bytes) {
			  if (err) {
			    resp.status(400).send({data: err});
			  }else{
			  	resp.setHeader('Content-Type', 'application/json');
				resp.send(JSON.stringify({totalBytes: archive.pointer(), name: 'Download.zip'}));
				console.log(archive.pointer() + ' total bytes');
			  }
			});*/
			// listen for all archive data to be written
			/*output.on('close', function() {
				resp.writeHead(200, {
		          "Content-Type": "application/octet-stream",
		          "Content-Disposition" : "attachment; filename='Download.zip'"});
				console.log("Location :: " + __dirname+ '/public/Download.zip');
		        fs.createReadStream(__dirname+ '/public/Download.zip').pipe(resp);
				console.log(archive.pointer() + 'close total bytes');
				
				console.log(archive.pointer() + ' resp.download close total bytes');
				resp.download(__dirname + '/public/Download.zip');
			});*/
			output.on('close', function() {
				resp.setHeader('Content-Type', 'application/json');
				resp.send(JSON.stringify({totalBytes: archive.pointer(), name: downloadName}));
				console.log(archive.pointer() + ' total bytes');
			});
			archive.finalize();
	   	}
	    else{
	     	console.log('Error while performing Query.' + err);
	     	resp.status(400).send({data: err});
	    }
	   
	});
});
// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);	
console.log('Connect to port:: ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
