import { nodeEnvEnumType } from "./interface";

/**
 * This code handles setting the process.env.NODE_ENV to the correct one.
 * This is necessary as the rest of the program requires a properly functioning process.env.NODE_ENV to work right.
 * @param {nodeEnvEnumType} overwrite - If you want to overwrite the value.
 * @returns {string} Either "development" or "production".
 */
export function nodeEnv(overwrite?: nodeEnvEnumType): string {
	try {
		logInfo("Setting process.env.NODE_ENV...");
		// As this function is going to be reused, I want to make sure we are not overwriting previously set NODE_ENV in other parts of the code.
		if (process.env.NODE_ENV != "" && process.env.NODE_ENV != undefined && process.env.NODE_ENV != "test") {
			logInfo(`NODE_ENV already set: ${process.env.NODE_ENV}`);
			return process.env.NODE_ENV;
		}

		// If we are providing overwrite.
		if (overwrite) {
			const validOverwrite: string[] = ["production", "development"];
			if (!validOverwrite.includes(overwrite)) {
				throw new Error("Invalid argument: expected 'production' or 'development'.");
			}
			return overwrite;
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

		logInfo(`NODE_ENV set to: ${env}`);
		return env;
	} catch (e: any) { throw new Error(e.message); }
};

/**
 * This checks what process.env.NODE_ENV you are running and returns correct bot token.
 * This is in case you have 2 bots, one for development and one for production.
 * @returns {string} - The token.
 */
export function getToken(): string {
	// This skips getting the token if it is already set.
	if (process.env.TOKEN != "" && process.env.TOKEN != undefined) {
		return process.env.TOKEN;
	}

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
};

/**
 * Setting this to :never fixes the issue in getToken where it thought it would be returning void.
 * @param {string} error The error message
 * @throws {Error}
 */
export function handleTokenError(error: string): never {
	throw new Error(`Environment variable ${error} is not set.`);
};

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
			"--unhandled-rejections=strict",
			"-r",
			"ts-node/register"
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
};

/**
 * This automatically checks whether you should provide the DEV App ID or not.
 * @returns {string} The correct App ID.
 */
export function getAppId(): string {
	// This skips getting the token if it is already set.
	if (process.env.APPID != "" && process.env.APPID != undefined) {
		return process.env.APPID;
	}

	// We can either set it with ="" or we can tell TS that there is supposed to be something here with !.
	let token: string = "";
	if (process.env.NODE_ENV === "production") {
		token = process.env.APP_ID || handleTokenError("APP_ID");
	} else if (process.env.NODE_ENV === "development") {
		token = process.env.DEV_APP_ID || handleTokenError("DEV_APP_ID");
	} else {
		throw new Error("Cannot get App ID!\nInvalid NODE_ENV value: expected \"production\" or \"development\".");
	}

	return token;
};

/**
 * This checks whether we should use DEV Guild ID or not.
 * @returns {string} The correct Guild ID
 */
export function getGuildId(): string {
	// This skips getting the token if it is already set.
	if (process.env.GUILDID != "" && process.env.GUILDID != undefined) {
		return process.env.GUILDID;
	}

	// We can either set it with ="" or we can tell TS that there is supposed to be something here with !.
	let token: string = "";
	if (process.env.NODE_ENV === "production") {
		token = process.env.GUILD_ID || handleTokenError("GUILD_ID");
	} else if (process.env.NODE_ENV === "development") {
		token = process.env.DEV_GUILD_ID || handleTokenError("DEV_GUILD_ID");
	} else {
		throw new Error("Cannot get Guild ID!\nInvalid NODE_ENV value: expected \"production\" or \"development\".");
	}

	return token;
};

/**
 * This will check if the identifier is UUID or Discord ID.
 * @param {string} identifier Either UUID or Discord ID.
 * @returns {boolean} True or false, whether the identifier was UUID or not.
 */
export function checkUUID(identifier: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(identifier);
};

/**
 * Logs an error in the console with a timestamp.
 * @param {Error | string} error The error message or Error object.
 * @returns {string} The error message.
 */
export function logError(error: Error | string): string {
	const time = new Date().toLocaleString();
	const message = error instanceof Error ? error.stack : error;
	console.error(`\n\n[${time}] - #### ERROR #### -\n${message}\n\n`);
	return String(message);
}

/**
 * This is a general log. Use it to nicely log stuff with date and time.
 * It ends with 1 line break.
 * You also have a line break before the message, so don't add it at the start.
 * @param {string} message a message as a string.
 * @returns {string} The message as a string.
 */
export function logGeneral(message: string): string {
	console.log(`[${new Date().toLocaleString()}]\n${message}\n`);
	return String(message);
};

/**
 * This is a general log. Use it to nicely log stuff with date and time.
 * It ends with 1 line break.
 * You also have a line break before the message, so don't add it at the start.
 * @param {string} message a message as a string.
 * @returns {string} The message as a string.
 */
export function logInfo(message: string): string {
	console.info(`[${new Date().toLocaleString()}] - ## INFO ## - \n${message}\n`);
	return String(message);
};

/**
 * This will capitalize the first letter of a string.
 * @param {string} str The string you want to capitalize.
 * @returns {string} The capitalized string.
 */
export function capitalizeFirstLetter(str: string): string {
	if (str.length === 0) return str; // Check if string is empty
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * This will capitalize a whole sentence, using space as the separator.
 * @param {string} sentence The sentence you want to capitalize.
 * @returns {string} The capitalized sentence, with space as separator.
 */
export function capitalizeEachWord(sentence: string): string {
	return sentence
		// Split the words.
		.split(' ')
		// Capitalize each word.
		.map(capitalizeFirstLetter)
		// Finally join them again.
		.join(' ');
}