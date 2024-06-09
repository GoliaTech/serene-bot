/**
 * This code handles setting the process.env.NODE_ENV to the correct one.
 * This is necessary as the rest of the program requires a properly functioning process.env.NODE_ENV to work right.
 */
export function nodeEnv() {
	try {
		// As this function is going to be reused, I want to make sure we are not overwriting previously set NODE_ENV in other parts of the code.
		if (process.env.NODE_ENV != "" && process.env.NODE_ENV != undefined) {
			return process.env.NODE_ENV;
		}

		const args: string[] = process.argv.slice(2);

		// I was tired of it, so I made it simpler.
		let env: string = "development";

		// We must check if we provide an argument.
		if (args.includes("-P")) {
			env = "production";
		} else if (args.includes("-D") || args.length == 0) {
			env = "development";
		} else {
			throw new Error("Invalid argument: expected '-P' or '-D'.");
		}

		return env;
	} catch (e: any) { throw new Error(e.message); }
}

/**
 * This checks what process.env.NODE_ENV you are running and returns correct bot token.
 * This is in case you have 2 bots, one for development and one for production.
 * @returns {string} - The token.
 */
export function getToken() {
	// This skips getting the token if it is already set.
	if (process.env.TOKEN != "" && process.env.TOKEN != undefined) { return process.env.TOKEN; }

	// We can either set it with ="" or we can tell TS that there is supposed to be something here with !.
	let token: string = "";
	if (process.env.NODE_ENV === "production") {
		token = process.env.TOKEN_PRODUCTION || handleTokenError("TOKEN_PRODUCTION");
	} else if (process.env.NODE_ENV === "development") {
		token = process.env.TOKEN_DEVELOPMENT || handleTokenError("TOKEN_DEVELOPMENT");
	} else {
		throw new Error("Invalid NODE_ENV value: expected \"production\" or \"development\".");
	}

	return token;
}

/**
 * Setting this to :never fixes the issue in getToken where it thought it would be returning void.
 * @param error The error message
 * @throws {Error}
 */
export function handleTokenError(error: string): never {
	throw new Error(`Environment variable ${error} is not set.`);
}

/**
 * These are the shard's execution argument variables. 
 * You want to keep different execArgv for production and development.
 * This function handles that separation.
 * @returns {string[]} - The array of execArgv to be parsed into shards.
 */
export function getExecArgv(): string[] {
	if (process.env.NODE_ENV === "production") {
		return [
			"--trace-warnings",
			"--unhandled-rejections=strict"
		];
	}
	// If it is not production. You can modify this array however you want.
	// What --inspect does, is it launches node inspector.
	return [
		// "--inspect=9239",
		"--trace-warnings",
		"-r",
		"ts-node/register"
	];
}
