function mean(array) {
  var _sum = 0;
  for (var i = 0; i < array.length; i++) {
    _sum += array[i];
  };
  return _sum / array.length;
}

function median(array) {
  var a = array.sort(function(a, b) {
      return a - b;
  });
  var l = a.length;

  if (l % 2 === 0) {
    console.log(a, a.slice(l/2 - 1, l/2 + 1));
    return mean(a.slice(l/2 - 1, l/2 + 1))
  } else {
    return a[(l-1)/2]
  }
}

a = [1000, 2, 2000, 4];

console.log(mean(a), median(a));