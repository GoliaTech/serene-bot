import { CommandInteraction, Events } from "discord.js";

/**
 * This is the main interaction function.
 */
const interaction = {
	name: Events.InteractionCreate,
	/**
	 * This is the execution for the interaction event.
	 * @param interaction The interaction.
	 * @returns It returns nothing
	 */
	execute(interaction: CommandInteraction) {
		if (!interaction.isCommand()) {
			if (process.env.NODE_ENV === "development") console.log("Command was not an interaction");
			return;
		}
	}
};

module.exports = [
	interaction,
];