module.exports = {
	cookieSecret : "Secret Cookies go here",
	gmail :{
		user: "ubo.oberoi@gmail.com",
		password:"password", 
	},
	mongo:{
		development:{
			connectionString: 'mongodb://localhost/testmeadowlark',
		},
		production:{
			connectionString:'mongo ds055689.mongolab.com:55689/testmeadowlark-uishant-plogin@db'
		},
	}
}

//ds055689.mongolab.com:55689/testmeadowlark-uishant-plogin@db

//mongodb://ishant:login@db@ds055689.mongolab.com:55689/testmeadowlark

//mongodb://localhost/testmeadowlark'  ---->    Works