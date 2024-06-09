import { ChatInputCommandInteraction, Client, ClientOptions, Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface CommandInteractionExtended extends CommandInteraction {
	interaction: {
		client: ClientExtended;
	};
}

export interface ClientExtended extends Client {
	commands: Collection<string, any>;
}

export interface Command {
	data: SlashCommandBuilder;
	execute(interaction: ChatInputCommandInteraction): any;
}

export class ClientExtended extends Client {
	public constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection<string, any>();
	}
}

export interface BotEvent {

}