import { EmbedBuilder, Locale, LocalizationMap, SlashCommandBuilder } from "discord.js";

/**
 * This creates a basic command, converts name to lowercases,
 * then also checks if you have the right length.
 * This is for the core of the command, do not use for sub commands or anything like that.
 * @param name - The command's name.
 * @param description - The command's description.
 * @param options - The command's options.
 * @param options.dm - Whether the command can be used in DMs or not. Defaults to false.
 * @param options.nsfw - Whether the command is NSFW or not. Defaults to false.
 * @param options.cooldown - The cooldown for the command. Its in seconds.
 * @param localization - The command's localization.
 * 
 */
export function commandBuilder(name: string, description: string,
	options?: { dm?: boolean; nsfw?: boolean, cooldown?: number, },
	localization?: {
		name?: LocalizationMap;
		description?: LocalizationMap;
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
	// The name is what the command will be called in discord. We could do some automation, like __dirname + __filename,
	// but if we are going to have multiple commands in one file, that would be stupid.
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

	if (localization) {
		// Loop through the localization for the name
		if (localization.name) {
			Object.entries(localization.name).forEach(([locale, localizedName]) => {
				// Basically, I tested this a few times and this should never happen.
				// If you manage to have it happen, do let me know.
				// if (!localizedName) {
				// 	console.log(`Name localization is missing! ${locale} | Skipping...`);
				// 	return;
				// }

				// We use ! because we expect it to have a value due to previously stated finding.
				if (localizedName!.length < 3 || localizedName!.length > 32) {
					throw new Error(`${locale} localized name must be between 3 and 32 characters long!`);
				}
				// SO...
				// I am UNBELIAVEBLY angry right now.
				// THE WHOLE TIME, the name had to be lowercase and without spaces.
				// WHY IS IT NOT WRITTEN ANYWHERE?! EXCUSE ME THE F???
				localizedName = localizedName!.replace(/\s/g, "_").toLowerCase();
				for (const dupa in Locale) {
					if (locale === Locale[dupa as keyof typeof Locale]) {
						command.setNameLocalization(Locale[dupa as keyof typeof Locale], localizedName);
					}
				}
			});
		}

		if (localization.description) {
			Object.entries(localization.description).forEach(([locale, localizedName]) => {
				// if (!localizedName) {
				// 	console.log("Name localization is missing!", locale, "Skipping...");
				// 	return;
				// }
				if (localizedName!.length < 3 || localizedName!.length > 100) {
					throw new Error(`${locale} localized description must be between 3 and 100 characters long!`);
				}
				for (const dupa in Locale) {
					if (locale === Locale[dupa as keyof typeof Locale]) {
						command.setDescriptionLocalization(Locale[dupa as keyof typeof Locale], localizedName);
					}
				}
			});
		}
	}

	// Finally return the built command to be used by commands.
	return command;
};


export function embedBuilder(title: string) {
	const embed = new EmbedBuilder({ title: title });
	return embed;
}