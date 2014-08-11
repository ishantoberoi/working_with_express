var express = require("express");

var app = express();
//console.log(app);

var handlebars = require("express3-handlebars")
				.create({
					defaultLayout:"main",
					helpers: {
						section: function(name,options){
							if(!this._sections){
								this._sections = {};
							}
								this._sections[name] = options.fn(this);
								return null;
						}
					}
				});


app.engine("handlebars",handlebars.engine);
app.set("view engine","handlebars");

app.use(express.static(__dirname+"/public")); // for static content

app.use(require("body-parser")()); // form handling POST data


var fortune = require("./lib/fortune.js"); // for function to be exposed by external liberary /lib folder

var credentials = require("./credentials.js");

app.use(require("cookie-parser")(credentials.cookieSecret));
app.use(require("express-session")());

// The order in which u declare ur routes is important...if u put 404 and 500 before actual
//routes every page will give error 

app.set("port",process.env.PORT || 3000);

// to make partials available for all views
app.use(function(req,res,next){
	if(!res.locals.partials){
		res.locals.partials = {};
	}
	res.locals.partials.weather = getWeatherData();
	next();
});

app.use(function(req,res,next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

/* Sending Email */
var nodemailer = require("nodemailer");

var mailTransport = nodemailer.createTransport("SMTP",{
	service : 'Gmail',
	port:"465",
	auth : {
		user : credentials.gmail.user,
		pass : credentials.gmail.password,
	}
});

mailTransport.sendMail({
	from:"'Ishant Oberoi' <ubo.oberoi@gmail.com>",
	to:"ishant.oberoi@flipkart.com",
	subject:"Testing Express Mailer..Meadowlark Tour",
	text: "Just see it works brilliantly"
},function(err){
	if(err)console.log("Unabble to send mail :"+error);
});

/* Sending Email ends*/


/* Routes begin here */

app.get("/",function(req,res){
	//eq.session.userName = "Anonymous";
	//var colorScheme = req.session.colorScheme || "dark";
	res.render("home");
});

app.get("/about",function(req,res){
	res.render("about", {fortune : fortune.getFortune()});
});

// app.get("/newsletter",function(req,res){
// 	res.render("newsletter",{csrf:"CSRF token goes here"});	
// });

/* flash messages with sessions */
app.get("/newsletter",function(req,res){
	res.render("newsletter");
});

app.post('/process', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	if(email !== "uboishant@yahoo.com") {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
		type: 'danger',
		intro: 'Validation error!',
		message: 'The email address you entered was not valid.',
	};
	return res.redirect(303, '/jquerytest');
}
	if(req.xhr) return res.json({ success: true });
		req.session.flash = {
		type: 'success',
		intro: 'Thank you!',
		message: 'You have now been signed up for the newsletter.',
	};
	return res.redirect(303, '/about');
});

/* flash messages with sessions ends */
app.get("/newsletterajax",function(req,res){
	res.render("newsletterajax");	
});

app.post("/processajax",function(req,res){
	if(req.xhr || req.accepts("json,html") === "json"){
		res.send({success:true});
	}
	else{
		res.redirect("302","/about")
	}
});

app.get("/jquerytest",function(req,res){
	res.render("jquerytest");
});

app.get("/header",function(req,res){
	res.set("Content-Type","text/plain");
	var s= "";
	for(var name in req.header){
		s += name+" : "+req.header[name]+"\n";
	}
	res.send(s);
});

app.get("/nursery-rhyme",function(req,res){
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme',function(){
	res.json({
		animal:"squirrel",
		bodyPart:"tail",
		adjective:"bushy",
		noun:"heck",
	});
});

/* File Upload */
var formidable = require("formidable");
app.get("/contest/vacation-photo",function(req,res){
	var now = new Date();
	res.render('vacation-photo');
});

app.post("/contest/vacation-photo",function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){	
		if(err)return res.redirect("303","/jquerytest");
		console.log("received fields");
		console.log(fields);
		console.log("received files");
		console.log(files);
		res.redirect("/home");
	});
});

/* File Upload ends */


app.listen(app.get("port"),function(){
	console.log("Express started on localhost:"+app.get("port")+"; press Ctrl+C to terminate");
});

function getWeatherData(){
	return {

		"locations": [
					{
					name: 'Portland',
					forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
					iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
					weather: 'Overcast',
					temp: '54.1 F (12.3 C)',
					},
					{
					name: 'Bend',
					forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
					iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
					weather: 'Partly Cloudy',
					temp: '55.0 F (12.8 C)',
					},
					{
					name: 'Manzanita',
					forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
					iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
					weather: 'Light Rain',
					temp: '55.0 F (12.8 C)',
					},
				],
			
			};
}


/* Always at last */
// custom 404 page
app.use(function(req,res){
	res.staus(404);
	res.render("404");
});


//custom 500 page
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500);
	res.render("500");
});
