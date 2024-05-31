/**
 * This code handles setting the process.env.NODE_ENV to the correct one.
 * This is necessary as the rest of the program requires a properly functioning process.env.NODE_ENV to work right.
 */
export function nodeEnv() {
	try {
		console.log("WE ARE TRYIN TO GET NODENV");
		// As this function is going to be reused, I want to make sure we are not overwriting previously set NODE_ENV in other parts of the code.
		if (process.env.NODE_ENV != "") {
			console.log("NODE_ENV is already set to", process.env.NODE_ENV);
			return process.env.NODE_ENV;
		}

		// Default environment.
		const defaultEnv = "development";

		// Here we will instantly define that the key is a string and the value it holds is also a string.
		const envMap: { [key: string]: string; } = {
			"--production": "production",
			"-P": "production",
			"-D": defaultEnv,
			"--development": defaultEnv
		};

		// Slice away the unnecessary stuff at the start.
		const args: string[] = process.argv.slice(2);

		// Determine the environment based on the provided arguments.
		// What this does, is it tries to find a match between the arg, and envMap[arg].
		// If there is no match, run default.
		const env = args.find(arg => envMap[arg]) || defaultEnv;

		return envMap[env];
	} catch (e: any) { throw new Error(e.message); }
}


/**
 * This checks what process.env.NODE_ENV you are running and returns correct bot token.
 * This is in case you have 2 bots, one for development and one for production.
 * @returns {string} - The token.
 */
export function getToken() {
	if (process.env.TOKEN != "") { return process.env.TOKEN; }
	let token;
	if (process.env.NODE_ENV === "production") {
		token = process.env.TOKEN_PRODUCTION || handleTokenError("TOKEN_PRODUCTION");
	} else if (process.env.NODE_ENV === "development") {
		token = process.env.TOKEN_DEVELOPMENT || handleTokenError("TOKEN_DEVELOPMENT");
	} else {
		throw new Error("Invalid NODE_ENV value: expected 'production' or 'development'.");
	}

	return token;
}


/**
 * Setting this to :never fixes the issue in getToken where it thought it would be returning void.
 * @param error The error message
 */
function handleTokenError(error: string): never {
	throw new Error(`Environment variable ${error} is not set.`);
}