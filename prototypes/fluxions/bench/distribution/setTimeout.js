var time = require('microtime');

const LENGTH = 1000;
const BLENGTH = 200;
const JITLENGTH = 10;

var bench_length, state, state_cpt;
var array = new Int32Array(LENGTH);

var jit = false;
var start = new time.now();
var end = new time.now();

// test function
function test(i) {
  return array[i]=array[i+1]+array[i+2];
}



// Boucle FOR
var loop = function() {
  for(var i = 0; i < LENGTH-3; i++) {
    test(i);
  }
};

// State Machine
var state_machine = function(cb){
  switch(state){
    case 1: {
      if (state_cpt >= LENGTH-3) {
        state = 2;
        break;
      }
      test(state_cpt++);
      break;
    }
    case 2: {
      if (bench_length-- > 0){
        state=1;
        state_cpt=0;
        break;
      } else {
        cb();
        return;
      }
    }
    default: {
      console.log("error");
    }
  }

  // Iteration
  setTimeout(state_machine, 0, cb);
};


var state_machine_with_loop = function(){
  while(true){
    switch(state){
      case 1: {
        if(state_cpt >= LENGTH-3){
          state = 2;
          break;
        }
        test(state_cpt++);
        break;
      }
      case 2: {
        if(bench_length-- > 0){
          state=1;
          state_cpt=0;
          break;
        }
        return;
      }
      default:
         console.log("error");
         return;
    }
  }
};

function bench(ITERATION) {
  // LOOP
  start = time.now();
  for(var i=0; i < ITERATION; i++){
    loop();
  }
  end = time.now();
  console.log("  >>> loop : " + ITERATION + " iteration" + ((ITERATION>1)?'s':'' ) + ", average of " + ((end - start)/ITERATION) + "μs" )

  // STATE MACHINE WITH LOOP
  bench_length = ITERATION;
  state = 1;
  state_cpt = 0;

  start = time.now();
  state_machine_with_loop();
  end = time.now();
  console.log("  >>> State machine with loop : " + ITERATION + " iteration" + ((ITERATION>1)?'s':'' ) + ", average of " + ((end - start)/ITERATION) + "μs" )

  // STATE MACHINE WITH SETTIMEOUT
  bench_length = ITERATION;
  state = 1;
  state_cpt = 0;

  start = time.now();
  var timeout = setTimeout(state_machine, 0, function() {
    end = time.now();
    console.log("  >>> State machine with SetTimeout : " + ITERATION + " iteration" + ((ITERATION>1)?'s':'' ) + ", average of " + ((end - start)/ITERATION) + "μs" )
    
    if (!jit) {
      jit = true;
      console.log(">> Bench");
      setTimeout(bench, 0, BLENGTH);
    }
  });
}

console.log(">> JIT init");
bench(JITLENGTH);
