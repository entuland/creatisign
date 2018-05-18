
function TimeoutLooper(startCallback, continueCallback, stepCallback, doneCallback, delay) {
	
	this.run = function() {
		startCallback();
		next();
	};
	
	function next() {
		if(!continueCallback()) {
			doneCallback();
			return;
		}
		stepCallback();
		setTimeout(next, delay);
	}
	
}

/*
	
	var loop = new TimeoutLooper(
		// start
		function() {

		},
		// continue
		function() {

		},
		// step
		function() {

		},
		// done
		function() {

		},
		// delay
		0
	);
	loop.run();
	
*/