function t(i) {
	console.log(i);
}

setTimeout(t, 0, 'A');
process.nextTick(t, 'B');