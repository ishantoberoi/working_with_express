var Browser = require('zombie'),
		assert = require('chai').assert;

var broswer;

suite("Cross page tests",function(){
	setup(function(){
		browser = new Browser();
	});

	// test("requesting rate, should populate referrer field",function(done){
	// 	var referrer = "http://locahost:3000/tours/hood-river";
	// 	browser.visit(referrer,function(){
	// 		browser.clickLink(".requestGroupRate",function(){
	// 			assert(browser.field('referrer').value === referrer);
	// 			done();
	// 		});
	// 	});
	// });

test('visiting the request group rate page directly', function(done){
	browser.visit('http://localhost:3000/tours/request-group-rate',
	function(){
		assert(browser.field('referrer').value === '');
		done();
	});
});

});