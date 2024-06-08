import { Collection, CommandInteraction } from "discord.js";

export interface CommandInteractionExtended extends CommandInteraction {
	interaction: {
		client: {
			commands: Collection<string, any>;
		};
	};
}
