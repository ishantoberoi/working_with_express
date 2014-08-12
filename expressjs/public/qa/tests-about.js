suite("About Page Tests",function(){
	test("Page should contain a link to contact page",function(){
		assert($('a[href="/contact"]').length);
	});
});