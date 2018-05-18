
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
