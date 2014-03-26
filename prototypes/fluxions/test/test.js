var assert = require("assert");
var flx = require("../lib/flx.js");
var testN = 0;

describe('Flx', function() {

	beforeEach(function() {
		testN++;
	});

	describe('register', function(){
	  it('should register a fluxion so that it can receive a message', function(done){
	    flx.register("test" + testN, function(msg) {
	    	done();
	    })

	    flx.start(flx.m("test" + testN, '1'));
	  })
	})

	describe('register', function(){
	  it('should register a fluxion so that it can hold a value', function(done){

	  	var test_value = Math.random();

	    flx.register("test" + testN, function(msg) {
	    	assert.equal(this.value, test_value);
	    	done();
	    }, {
	    	value: test_value
	    })

	    flx.start(flx.m("test" + testN, '2'));
	  })
	})

	describe('register', function(){
	  it('should register a fluxion so that it can get a value from message', function(done){
	  	var test_value = Math.random();

	    flx.register("test" + testN, function(msg) {
	    	assert.equal(msg, test_value);
	    	done();
	    })
	    flx.start(flx.m("test" + testN, test_value));
	  })
	})

	describe('register', function(){
	  it('should register a fluxion so that it can pass a message from one fluxion to another', function(done){

	    flx.register("test" + testN, function(msg) {
	    	return flx.m("test" + testN + "output");
	    })
	    flx.register("test" + testN + "output", function(msg) {
	    	done();
	    })

	    flx.start(flx.m("test" + testN));
	  })
	})	
})

