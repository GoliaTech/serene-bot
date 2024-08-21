/**
 * 
 * @param {number} loops 
 * @returns 
 */
function calculate(loops) {
	const counters = [];
	let counter = 0;
	for (let i = 0; i < loops; i++) {
		const result = Math.random() * 1;
		counters.push((result).toFixed(3));
		counter += result;
	}

	return {
		counters: counters,
		counter: counter
	};
}

/**
 * 
 * @param {number} loops 
 * @returns 
 */
function customRandom(loops) {
	const counters = [];
	let counter = 0;
	const r = Math.random();

	for (let i = 0; i < loops; i++) {
		let result = 0;
		if (r < 0.7) {
			// 70% chance to get a value between 0-50
			result = Math.floor(Math.random() * 51);
		} else if (r < 0.9) {
			// 20% chance to get a value between 51-70
			result = 51 + Math.floor(Math.random() * 20);
		} else if (r < 0.98) {
			// 8% chance to get a value between 71-90
			result = 71 + Math.floor(Math.random() * 20);
		} else {
			// 2% chance to get a value between 91-100
			result = 91 + Math.floor(Math.random() * 10);
		}
		counter += result;
		counters.push(result);
	}

	return {
		counters: counters,
		counter: counter
	};
}

function maser() {
	const loops = 10;
	const standardMath = calculate(loops);
	const customMath = customRandom(loops);

	console.log(`
**STANDARD RANDOM**
	Total: ${standardMath.counter}
	Average: ${(standardMath.counter / loops).toFixed(3)}
	Min: ${Math.min(...standardMath.counters)}
	Max: ${Math.max(...standardMath.counters)}
	Numbers: ${standardMath.counters.join(", ")}

**CUSTOM RANDOM**
	Total: ${customMath.counter}
	Average: ${(customMath.counter / loops).toFixed(3)}
	Min: ${Math.min(...customMath.counters)}
	Max: ${Math.max(...customMath.counters)}
	Numbers: ${customMath.counters.join(", ")}	
	`);
}

maser();