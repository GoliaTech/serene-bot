import { UUID } from "crypto";
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
	public commands: Collection<string, any>;
}

export interface BotEvent {
	name: string;
	execute(...args: any[]): any;
	once?: boolean;
}

export interface UserCoreModel {
	user_uuid: UUID;
	discord_id: string;
	daily_streak: number;
}

export enum nodeEnvEnum {
	development = "development",
	production = "production"
}

export type nodeEnvEnumType = nodeEnvEnum.development | nodeEnvEnum.production;