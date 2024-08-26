import { ChatInputCommandInteraction, Client, ClientOptions, Collection, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export enum EmbedColors {
	"default" = "#ED4D84",
	"success" = "#A5D6A7",
	"warning" = "#FFA827",
	"error" = "#E10400",
	"information" = "#81D4FA",
	"pending" = "#CE93D8",
	"announcement" = "#8E24AA"
}


/**
 * Extending the basae CommandInteraction with what I need.
 */
export interface CommandInteractionExtended extends CommandInteraction {
	interaction: {
		client: ClientExtended;
	};
};

/**
 * Extending base CLient class from Discord.js
 */
export interface ClientExtended extends Client {
	commands: Collection<string, any>;
};

/**
 * This is a Command interface, how it should look like. 
 */
export interface I_Command {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
	execute(interaction: ChatInputCommandInteraction): any;
};

/**
 * Extends the base client CLASS, not interface.
 */
export class ClientExtended extends Client {
	public constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection<string, any>();
	}
	public commands: Collection<string, any>;
};

/**
 * BotEvent interface. Handles how an event should look like.
 */
export interface I_BotEvent {
	name: string;
	execute(...args: any[]): any;
	once?: boolean;
};

/**
 * This is the choice you have for nodeenv.
 */
export enum nodeEnvEnum {
	development = "development",
	production = "production"
};

/**
 * The type of nodeEnvEnum. Can either be Production of development.
 * I had to do a type, because for some reason some parts of the code in Bot and Start didn't accept enum as a type, strange huh, lol.
 */
export type nodeEnvEnumType = nodeEnvEnum.development | nodeEnvEnum.production;

/**
 * The enum list for rarities the database accepts.
 */
export enum CardRarity {
	"common" = "common",
	"uncommon" = "uncommon",
	"rare" = "rare",
	"epic" = "epic",
	"mythic" = "mythic",
	"legendary" = "legendary",
	"ancient" = "ancient"
};

/**
 * The list of values a card can have.
 */
export enum CardValueType {
	"common" = "common",
	"premium" = "premium"
};

/**
 * The list of different reward types, completing a set gives you.
 */
export enum CardRewardType {
	"common_currency" = "common currency",
	"premium_currency" = "premium currency",
	"xp" = "xp",
	"avatar" = "avatar",
	"banner" = "banner"
};

export enum E_CurrencyTypes {
	common, premium
}