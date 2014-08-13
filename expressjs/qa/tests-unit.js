var fortune = require("../lib/fortune.js");
var expect = require("chai").expect;


suite('Fortune cookie test using chai expert',function(){
	test("getfortune() must return a string",function(){
		expect(typeof fortune.getFortune() === "string");
	});
});