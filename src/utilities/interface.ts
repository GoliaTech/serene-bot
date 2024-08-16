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
export interface Command {
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
export interface BotEvent {
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

/**
 * The set of a cards interface.
 */
export interface CardSet {
	id: number;
	name: string;
	tagline: string;
	lore: string;
	rarity: CardRarity;
	border_image: string;
	cover_image: string;
	cards: CardCore[];
	rewards: CardRewards[];
};

/**
 * This is how a core of the card looks like.
 */
export interface CardCore {
	id: number;
	name: string;
	tagline: string;
	lore: string;
	set: CardSet;
	release_date: Date;
	rarity: CardRarity;
	border_image: string;
	image_path: string;
	artist_name: string;
	artist_link: string;
	value: number;
	value_type: CardValueType;
};

/**
 * The card rewards interface.
 */
export interface CardRewards {
	reward_id: number;
	set: CardSet;
	reward_type: CardRewardType;
	reward_value: number;
};

/**
 * This is how a UserCore looks like.
 */
export interface UserCore {
	uuid: string;
	display_name: string | undefined;
	discord_id: string;
	joined_at: Date;
};

/**
 * This is how a UserCurrency looks like.
 */
export interface UserCurrency {
	uuid: string;
	core: UserCore;
	common: number;
	premium: number;
}

/**
 * This is how a UserLevel looks like.
 */
export interface UserLevel {
	uuid: string;
	core: UserCore;
	level: number;
	xp: number;
	xp_to_level: number;
	prestige: number;
}