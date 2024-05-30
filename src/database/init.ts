// Here we will write initialization code for the database.
import { models, seql } from "./models/index";

// As with the models/index, I use this just in case, for the BIGINT values.
require("pg").defaults.parseInt8 = true;

// I have to do this terribleness, because many things here require await calls.
(async () => {
	try {
		console.log(`[${new Date().toUTCString()}] - Initializing database.`);

		// First let's process arguments that a user can provide.
		const processArgs: string[] = process.argv.slice(2);
		let force: boolean = false, alter: boolean = false;

		// Check what argument(s) we are providing and throw an error if we are doing someting bad.
		if (processArgs.includes("-f") && processArgs.includes("-a")) {
			console.error("You cannot do both force and alter!");
			return;
		}
		else if (processArgs.includes("-f")) {
			// You have to be careful whilst using force.
			// It DELETES everything in the database and re-initializes it.
			console.log("Applying forced...");
			force = true;
		}
		else if (processArgs.includes("-a")) { alter = true; }

		// Once we have some models, this is where we should put what we want to synchronize.
		// BEFORE the actual .sync function gets called.

		// Sync the database.
		await seql.sync({ force: force, alter: alter });

		// Close the connection after it. It's not needed on a local database, but it's a good practice.
		await seql.close();
		console.log(`[${new Date().toUTCString()}] - Closing connection and quitting.`);
		process.exit(0);
	} catch (e) {
		console.error(`ERROR\n[${new Date().toUTCString()}]`, e);
		process.exit(1);
	}
})();