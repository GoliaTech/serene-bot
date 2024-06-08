import { Locale, LocaleString, LocalizationMap, SlashCommandBuilder } from "discord.js";

/**
 * This creates a basic command, converts name to lowercases,
 * then also checks if you have the right length.
 * This is for the core of the command, do not use for sub commands or anything like that.
 * @param {string} name - The command's name.
 * @param {string} description - The command's description.
 * @param {object} options - The command's options.
 * @param {boolean} options.dm - Whether the command can be used in DMs or not. Defaults to false.
 * @param {boolean} options.nsfw - Whether the command is NSFW or not. Defaults to false.
 * @param {Localization} localization - The command's localization.
 */
export function commandBuilder(name: string, description: string,
	options?: { dm?: boolean; nsfw?: boolean, },
	localization?: {
		name: LocalizationMap;
		description: LocalizationMap;
	},
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
		.setName(name)
		// Set description.
		.setDescription(description);

	// We don't need to check if(nsfw) and so on, because we are already doing it in one line.
	command
		// Check if DM is provided and if it is, set DMs value, otherwise default to false.
		.setDMPermission(options?.dm ? options.dm : false)
		// Same as DM.
		.setNSFW(options?.nsfw ? options.nsfw : false);

	// Screw it, the simplest solution is always the best...
	// First we loop through each entry. We could just use values instead, but heck it.
	// Then we check if they are Okie-dokie, if not, throw error.
	// THEN finally, we just apply ALL of them at once...
	if (localization) {
		// Loop through the localization for the name
		if (localization.name) {
			Object.entries(localization.name).forEach(([locale, localizedName]) => {
				if (!localizedName) {
					console.log("Name localization is missing!", locale, "Skipping...");
					return;
				}
				if (localizedName.length < 3 || localizedName.length > 32) {
					throw new Error(`${locale} localized name must be between 3 and 32 characters long!`);
				}
				console.log(locale as Locale);
			});
		}
		command.setNameLocalization(Locale.Bulgarian, localization.name["bg"] ? localization.name["bg"] : null);
		// command.setNameLocalizations({
		// 	bg: localization.name["bg"] ? localization.name["bg"] : null,
		// 	cs: "czech",
		// 	de: "german",
		// 	el: "greek",
		// 	fi: "finnish",
		// 	fr: "french",
		// 	hi: "hindi",
		// 	hr: "croatian",
		// 	hu: "hungarian",
		// 	it: "italian",
		// 	ja: "japanese",
		// 	ko: "korean",
		// 	"sv-SE": "swedish",
		// 	"zh-CN": "chinese",
		// 	"zh-TW": "chinese",
		// 	"es-419": "spanish",
		// 	"es-ES": "spanish",
		// 	"en-GB": "english",
		// 	"en-US": "english",
		// 	"pt-BR": "portuguese",
		// 	ru: "russian",
		// 	tr: "turkish",
		// 	uk: "ukrainian",
		// 	da: "danish",
		// 	id: "indonesian",
		// 	no: "norwegian",
		// 	pl: "polish",
		// 	ro: "romanian",
		// 	th: "thai",
		// 	vi: "vietnamese",
		// 	lt: "lithuanian",
		// 	nl: "dutch",
		// });
	}

	// Finally return the built command to be used by commands.
	return command;
};