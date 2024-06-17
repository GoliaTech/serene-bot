import { nodeEnv } from "../../utilities/utilities";

/**
 * This will process the .NODE_ENV, see if it is == "development". 
 * If it is, it will use development variables, otherwise production variables.
 */
export function processDatabaseConnectionVariables() {
	process.env.NODE_ENV = nodeEnv();
	console.info("NODE_ENV:", process.env.NODE_ENV);

	// Apparently we have to do this env. stuff here...
	const name = process.env.NODE_ENV == "development" ? process.env.DB_DEV_NAME : process.env.DB_PROD_NAME;
	const host = process.env.NODE_ENV == "development" ? process.env.DB_DEV_HOST : process.env.DB_PROD_HOST;
	const user = process.env.NODE_ENV == "development" ? process.env.DB_DEV_USER : process.env.DB_PROD_USER;
	const pass = process.env.NODE_ENV == "development" ? process.env.DB_DEV_PASS : process.env.DB_PROD_PASS;

	console.info(name, host, user, pass);

	// Make sure we are not returning an empty or undefined thing.
	if (!name || !host || !user || !pass) {
		throw new Error("Name, host, user, or pass, (or all) is empty! Please fix!");
	}

	return {
		name: name,
		host: host,
		user: user,
		pass: pass
	};
}

// I just moved it here.
