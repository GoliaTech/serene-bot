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

/**
 * 
 * @param {number} multiplier multiplier
 * @param {number} loops how many times to loop this
 * @returns {{common: number, uncommon: number, rare: number, epic: number, mythical: number, legendary: number, ancient: number}}
 */
function rarityRandom(multiplier, loops) {
	const rarities = {
		common: 0,
		uncommon: 0,
		rare: 0,
		epic: 0,
		mythical: 0,
		legendary: 0,
		ancient: 0
	};

	for (let i = 0; i < loops; i++) {
		let r = Math.floor(Math.random() * 10000);  // Generates a random number between 0 and 9999

		// Adjust thresholds based on the multiplier. This ensures that the increase is proportional.
		let thresholds = {
			common: 6000 - multiplier * 600,	// Slightly reduce the threshold for common as the multiplier increases.
			uncommon: 8000 - multiplier * 500,	// Reduce the threshold for uncommon.
			rare: 9000 - multiplier * 400,		// Similarly, reduce for rare.
			epic: 9500 - multiplier * 300,		// Slightly reduce for epic.
			mythical: 9800 - multiplier * 100,	// Smaller reduction for mythical.
			legendary: 9990 - multiplier * 50,	// Minimal reduction for legendary.
			ancient: 10000						// No change for ancient since it's the highest tier.
		};

		// Ensure the thresholds do not overlap or go below 0.
		thresholds.common = Math.max(0, thresholds.common);
		thresholds.uncommon = Math.max(thresholds.common + 1, thresholds.uncommon);
		thresholds.rare = Math.max(thresholds.uncommon + 1, thresholds.rare);
		thresholds.epic = Math.max(thresholds.rare + 1, thresholds.epic);
		thresholds.mythical = Math.max(thresholds.epic + 1, thresholds.mythical);
		thresholds.legendary = Math.max(thresholds.mythical + 1, thresholds.legendary);

		// Determine the reward based on adjusted thresholds.
		if (r < thresholds.common) {
			rarities.common++;
		} else if (r < thresholds.uncommon) {
			rarities.uncommon++;
		} else if (r < thresholds.rare) {
			rarities.rare++;
		} else if (r < thresholds.epic) {
			rarities.epic++;
		} else if (r < thresholds.mythical) {
			rarities.mythical++;
		} else if (r < thresholds.legendary) {
			rarities.legendary++;
		} else {
			rarities.ancient++;
		}
	}

	return rarities;
}

/**
 * 
 * @param {{common: number, uncommon: number, rare: number, epic: number, mythical: number, legendary: number, ancient: number}} rewards 
 * @returns {string}
 */
function displayRewards(rewards) {
	return `**Common:** ${rewards.common}\n**Uncommon:** ${rewards.uncommon}\n**Rare:** ${rewards.rare}\n**Epic:** ${rewards.epic}\n**Mythical:** ${rewards.mythical}\n**Legendary:** ${rewards.legendary}\n**Ancient:** ${rewards.ancient}`;
}

(() => {
	// maser();
	const loops = 28;
	const dailyMultiplier = 1;
	const weeklyMultiplier = 5;
	const monthlyMultiplier = 10;
	const dailyRewards = rarityRandom(dailyMultiplier, loops);
	const weeklyRewards = rarityRandom(weeklyMultiplier, loops);
	const monthlyRewards = rarityRandom(monthlyMultiplier, loops);
	console.log(`[DAILY]\n${displayRewards(dailyRewards)}\n\n[WEEKLY]\n${displayRewards(weeklyRewards)}\n\n[MONTHLY]\n${displayRewards(monthlyRewards)}`);
})();
