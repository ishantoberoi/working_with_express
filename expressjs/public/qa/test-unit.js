var fortune = require("./lib/fortune.js");
var expect = require("chai").expect;

suite("fortune cookie  tests",function(){
	test("getfortune() returna a fortune",function(){
		expect(typeof fortune.getfortune() === "string");
	});
});