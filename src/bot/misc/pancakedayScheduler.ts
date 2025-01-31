// src/scheduler/pancakeEventScheduler.ts
import cron from "node-cron";
import { DataSource } from "typeorm";
import { User } from "../../database/entity";
import { findOrCreateUser } from "../../database/dao/user";

// This variable is a simple in-memory flag to tell if the event is active
// In a clustered environment or multiple processes, you'd store this in a DB or cache
let isPancakeDayActive = false;

export function startPancakeDayEventScheduler(dataSource: DataSource) {
	// Cron pattern: “0 0 * * TUE” => every Tuesday at 00:00
	cron.schedule("0 0 * * TUE", async () => {
		console.log("Pancake Day started!");
		isPancakeDayActive = true;

		// Optionally store the start time in DB, or other logic
		// e.g. create an Event entity row with `start = new Date()`

		// Schedule an automatic end 24 hours later
		setTimeout(async () => {
			console.log("Pancake Day ended!");
			isPancakeDayActive = false;

			// Clear pancakesBaked for all users so we reset the leaderboard
			// but keep their ingredients.
			const userRepo = dataSource.getRepository(User.Pancakes);
			await userRepo.createQueryBuilder()
				.update()
				.set({ pancakesBaked: 0 })
				.execute();

			// Optionally store the end time in DB or do something else
		}, 24 * 60 * 60 * 1000); // 24 hours in ms
	});
}

export function getIsPancakeDayActive(): boolean {
	const testing = true;
	if (testing) {
		isPancakeDayActive = true;
		return isPancakeDayActive;
	}
	return isPancakeDayActive;
}
