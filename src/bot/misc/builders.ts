import { EmbedBuilder, InteractionContextType, Locale, LocalizationMap, SlashCommandBuilder } from "discord.js";
import { EmbedColors } from "../../utilities/interface";

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
 * @param options.owner - If the command can be used by everyone else, or just owner.
 * @param localization - The command's localization.
 * 
 */
export function commandBuilder(
	name: string,
	description: string,
	options?: {
		// If command is allowed in DMs.
		dm?: boolean;
		// If the command is for NSFW channels only.
		nsfw?: boolean;
	},
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

	// if a command has been set to nsfw
	command.setNSFW(options?.nsfw ? options.nsfw : false);

	// Thanks for updating contexts, I have to do this for now...
	if (options?.dm == true) {
		command.setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM]);
	} else if (options?.dm == false || !options?.dm) {
		command.setContexts([InteractionContextType.Guild]);
	}

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

/**
 * Use this builder to create replies to interactions and messages, as it includes some predefined stuff.
 * This will create an embed, with some default things. 
 * It is basically just EmbedBuilder just with some default stuff set.
 * @param title - Title of your embed.
 * @param color - Color of your embed. Not necessary. Sets to EmbedColors.default if not provided.
 * @returns 
 */
export function embedBuilder(title?: string, color?: EmbedColors) {
	const embed = new EmbedBuilder({ timestamp: new Date(), footer: { text: "serene-bot" } });
	// It looks ugly, ew.
	// embed.setAuthor({ name: "Bot", url: "https://sucrosia.xyz:5050/" });
	if (title) embed.setTitle(title);
	if (!color) {
		embed.setColor(EmbedColors.default);
	} else {
		embed.setColor(color);
	}
	return embed;
}

export function errorEmbedBuilder(error: any) {
	const embed = embedBuilder("**ERROR**", EmbedColors.error);
	embed.setDescription(String(error));

	return embed;
}