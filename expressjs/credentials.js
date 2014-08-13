module.exports = {
	cookieSecret : "Secret Cookies go here",
	gmail :{
		user: "ubo.oberoi@gmail.com",
		password:"password", 
	},
	mongo: {
		development : {
			connectionString:"mongodb://ishant:login@db@ds055709.mongolab.com:55709/express_meadowlark"
		},
		production:{
			connectionString:"mongodb://ishant:login@db@ds055709.mongolab.com:55709/express_meadowlark"
		}
	}
}