setTimeout(generator = function() {
  console.log(Math.floor(Math.random() * 20));
  setTimeout(generator, Math.floor(Math.random() * 1000 + 1000))
})