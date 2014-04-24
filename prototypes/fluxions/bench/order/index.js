console.log(__dirname);

var index = 0;

function test(name) {
	console.log((index++) + " " + name);
}

setImmediate(function() {
	test("setImmediate");
})

setTimeout(function() {
	test("setTimeout");
}, 0);

process.nextTick(function() {
	test("nextTick");
})

test("directCall");