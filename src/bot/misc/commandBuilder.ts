import { SlashCommandBuilder } from "discord.js";

/**
 * This creates a basic command, converts name to lowercases,
 * then also checks if you have the right length.
 * This is for the core of the command, do not use for sub commands or anything like that.
 * @param {string} filename - The __filename property. Just parse that.
 * @param {string} name - The command's name.
 * @param {string} description - The command's description.
 * @param {object} options - The command's options.
 * @param {boolean} options.dm - Whether the command can be used in DMs or not. Defaults to false.
 * @param {boolean} options.nsfw - Whether the command is NSFW or not. Defaults to false.
 * @param {object} localization - The command's localization.
 * @param {object} localization.name - The command's name in different languages.
 * @param {string} localization.name.en_gb - The command's name in British English.
 * @param {string} localization.name.en_us - The command's name in American English.
 * @param {object} localization.description - The command's name in different languages.
 * @param {string} localization.description.en_gb - The command's name in British English.
 * @param {string} localization.description.en_us - The command's name in American English.
 */
export function commandBuilder(filename: string, name: string, description: string,
	options?: { dm?: boolean, nsfw?: boolean, },
	localization?: {
		name: {
			en_gb?: string,
			en_us?: string,
		},
		description: {
			en_gb?: string,
			en_us?: string,
		};
	}
) {
	// We will have to check if the user provided right amount of string length, as well as other info.
	if (name.length < 3 || name.length > 32) {
		throw new Error("Name must be between 3 and 32 characters long!");
	}
	// We must also check if the description string has the right length as well.
	if (description.length < 3 || description.length > 100) {
		throw new Error("Description must be between 3 and 100 characters long!");
	}
	// If the length is correct, we have to then sanitize the string. This means that if a string has whitespace, we have to replace it with _.
	// We also have to make sure that the string is lowercase, as discord.js requires it.
	name = name.replace(/\s/g, "_").toLowerCase();
	const command = new SlashCommandBuilder()
		.setName(`${filename}_${name}`)
		// Set description.
		.setDescription(description);

	// Check if we are providing the builder some options.
	if (options) {
		command
			// Check if DM is provided and if it is, set DMs value, otherwise default to false.
			.setDMPermission(options.dm ? options.dm : false)
			// Same as DM.
			.setNSFW(options.nsfw ? options.nsfw : false);
	}

	// Localization still under testing.
	// Thankfully for localization, these are the NAMES that will be displayed when using the command, as far as I know...
	// So we won't have to do whitespace correction.
	if (localization) {
		// What we will have to do, is we will have to loop through localization input, and correct their length.
		if (localization?.name) {
			Object.keys(localization.name).forEach(key => {
				// This is absolutely stupid and overcomplicated but I couldn't find a better way...
				const value = localization.name[key as keyof typeof localization.name];
				// If the length is incorrect, throw an error.
				if (value && (value.length < 3 || value.length > 32)) {
					throw new Error(`The localized name for ${key} should be between 3 and 32 characters long!`);
				}
			});
		}

		if (localization?.description) {
			Object.keys(localization.description).forEach(key => {
				// This is absolutely stupid and overcomplicated but I couldn't find a better way...
				const value = localization.description[key as keyof typeof localization.description];
				// If the length is incorrect, throw an error.
				if (value && (value.length < 3 || value.length > 100)) {
					throw new Error(`The localized name for ${key} should be between 3 and 100 characters long!`);
				}
			});
		}

		// Finally set the available localized names.
		command
			.setNameLocalizations({
				"en-GB": localization.name.en_gb,
				"en-US": localization.name.en_us
			})
			.setDescriptionLocalizations({
				"en-GB": localization.name.en_gb,
				"en-US": localization.name.en_us
			});
	}

	// Finally return the built command to be used by commands.
	return command;
};
