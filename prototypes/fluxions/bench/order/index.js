console.log(__dirname);

var index = 0;
var str = "";

function test(name) {
	str += name + " + ";
	if (++index === 4) {
		console.log(str);
	}
	// console.log((index++) + " " + name);
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