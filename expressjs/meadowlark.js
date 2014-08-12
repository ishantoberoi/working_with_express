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

app.use(function(req,res,next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

//console.log(__dirname);

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


/* Connecting to and working with MongoDB */
app.set("env","development"); // setting a global varaible

var mongoose = require("mongoose");
var opts = {
	server:{
		socketOptions:{keepAlive:1}
	}
}
console.log(app.get("env"));
switch(app.get("env")){
	case "development":
			mongoose.connect(credentials.mongo.development.connectionString,opts);
			console.log(credentials.mongo.development.connectionString);
			break;
	case "production":
			mongoose.connect(credentials.mongo.production.connectionString,opts);
			console.log(credentials.mongo.development.connectionString);
			break;
	default:
					//throw new Error('Unknown execution environment: '+app.get('env'));
					console.log(app.get("env"));
					break;
}

//mongoose.connect(credentials.mongo.development.connectionString,opts);

var Vacation = require("./models/vacations.js");
Vacation.find(function(err,vacations){
	if(vacations.length) return;

	new Vacation({
		name: 'Hood River Day Trip',
		slug: 'hood-river-day-trip',
		category: 'Day Trip',
		sku: 'HR199',
		description: 'Spend a day sailing on the Columbia and enjoying craft beers in Hood River!',
		priceInCents: 9995,
		tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
		inSeason: true,
		maximumGuests: 16,
		available: true,
		packagesSold: 0,
	}).save();

	new Vacation({
		name: 'Oregon Coast Getaway',
		slug: 'oregon-coast-getaway',
		category: 'Weekend Getaway',
		sku: 'OC39',
		description: 'Enjoy the ocean air and quaint coastal towns!',
		priceInCents: 269995,
		tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
		inSeason: false,
		maximumGuests: 8,
		available: true,
		packagesSold: 0,
	}).save();

	new Vacation({
		name: 'Rock Climbing in Bend',
		slug: 'rock-climbing-in-bend',
		category: 'Adventure',
		sku: 'B99',
		description: 'Experience the thrill of climbing in the high desert.',
		priceInCents: 289995,
		tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
		inSeason: true,
		requiresWaiver: true,
		maximumGuests: 4,
		available: false,
		packagesSold: 0,
		notes: 'The tour guide is currently recovering from a skiing accident.',
	}).save();

});

app.get("/vacations",function(req,res){
	Vacation.find({available:true},function(err,vacations){
		var context = {
			vacations : vacations.map(function(vacation){
				return {
					sku:vacation.sku,
					name:vacation.name,
					description:vacation.description,
					price:vacation.getDisplayPrice(),
					inSeason:vacation.inSeason,
				}
			})
		};
	//	console.log(context);
		res.render("vacations",context);
	});
});

var VacationInSeasonListener = require("./models/vacationInSeasonListener.js");
app.get("/notify-me-when-in-season",function(req,res){
	res.render("notify-me-when-in-season",{sku:req.query.sku});
});

app.post("/notify-me-when-in-season",function(req,res){
	VacationInSeasonListener.update(
		{email:req.body.email},
		{$push:{skus:req.body.sku}},
		{upsert:true},
		function(err){
			if(err){
					console.error(err.stack);
					req.session.flash = {
					type: 'danger',
					intro: 'Ooops!',
					message: 'There was an error processing your request.',
				};
				return res.redirect(303, '/vacations');
			}
			req.session.flash = {
				type: 'success',
				intro: 'Thank you!',
				message: 'You will be notified when this vacation is in season.',
			};
			return res.redirect(303, '/vacations');
		}
	);
});

/* Connecting to and working with MongoDB ends */

app.get("/",function(req,res){
	res.cookie("monster","nom nom");
	res.cookie("signed_monster","nom nom",{signed:true});
	res.render("home");
});

app.get("/about",function(req,res){
	res.render("about", {fortune : fortune.getFortune()});
});

app.get("/newsletter",function(req,res){
	res.render("newsletter",{csrf:"CSRF token goes here"});	
});

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

app.post("/process",function(req,res){
	console.log("FORM querstring: "+req.query.form+"\n");
	console.log("CSRF token from hidden field: "+req.body.csrf+"\n");
	console.log('Email (from visible form field): ' + req.body.email);
	res.redirect(303, '/about');
});

app.get("/jquerytest",function(req,res){
	res.render("jquerytest");
});

app.get("/header",function(){
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
