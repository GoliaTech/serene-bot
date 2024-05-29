import { SlashCommandBuilder } from "discord.js";

/**
 * This creates a basic command, converts name to lowercases,
 * then also checks if you have the right length.
 * This is for the core of the command, do not use for sub commands or anything like that.
 * @param {string} name The name of the command.
 * @param {string} description The description of the command.
 * @param {boolean} dm You can leave it blank, default: false.
 * @param {boolean} nsfw Allow this command to be used in nsfw channels, or leave empty. Default is false.
 * @returns
 */
export function commandBuilder(name: string, description: string, dm?: boolean, nsfw?: boolean) {
	// We will have to check if the user provided right amount of string length.
	const data = new SlashCommandBuilder()
		.setName(String(name).toLowerCase())
		.setDMPermission(dm ? dm : false)
		.setNSFW(nsfw ? nsfw : false)
		.setDescription(description);

	return data;
}
