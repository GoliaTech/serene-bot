import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, ClientOptions, Collection, CommandInteraction, Message, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, StringSelectMenuInteraction } from "discord.js";

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
export interface CommandInteractionExtended extends ChatInputCommandInteraction {
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
	options?: {
		botOwner?: boolean;
		owner?: boolean;
		cooldown?: number;
		admins?: boolean;
		mods?: boolean;
		staff?: boolean;
		disabled?: boolean;
	};
};

/**
 * Use the execute(ineraction, data) for small data interaction.
 */
export interface I_OtherCommand {
	customID: string;
	/* Use data for small data interaction */
	execute(ineraction: ButtonInteraction | AutocompleteInteraction | ModalSubmitInteraction | StringSelectMenuInteraction, data?: any): void;
	disabled?: boolean;
}

export interface I_MessageCommand {
	data: {
		name: string;
	};
	options?: {
		botOwner?: boolean;
	};
	execute(message: Message, args?: string[]): void;
}

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
	disabled?: boolean;
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
	common,
	premium
}

export enum rarities {
	common = "common",
	uncommon = "uncommon",
	rare = "rare",
	epic = "epic",
	mythical = "mythical",
	legendary = "legendary",
	ancient = "ancient"
};

export enum rewardTypes {
	common_currency = "common currency",
	premium_currency = "premium currency",
	xp = "xp",
	materials = "material",
	lootbox_key = "lootbox key"
};

export enum lootboxKeys {
	common = "common lootbox key",
	rare = "rare lootbox key",
	epic = "epic lootbox key",
	mythical = "mythical lootbox key",
	legendary = "legendary lootbox key",
	ancient = "ancient lootbox key"
};

export type Reward = {
	tier: rarities;
	rewardType: rewardTypes;
	reward: number | { amount: number; type: lootboxKeys | string; };
};


/**
 * This is the return type of the findOrCreateUser function.
 */
export interface I_findOrCreateUser {
	data: {
		uuid: string,
		displayName: string | null,
		discordID: string,
		joinedAt: Date,
		common: number,
		premium: number,
		level: number,
		prestige: number,
		xp: number,
		xpToLevel: number,
		levelName: string,
		prestigeName: string;
	} | string,
	error?: boolean;
};

export interface I_addedItem {
	id: number;
	uuid: string;
	// name: string;
	// description: string;
	// lore: string;
	amount: number;
	// maxStack: number;
};

export interface I_secretsanta {
	id: string;
	likes: string[];
	dislikes: string[];
	funnyfaq: string;
	emergencysanta: boolean;
}

export interface I_MusicList {
	name: string;
	artist: string;
	ytmusic: string;
	genre?: string[];
	spotify?: string;
	year?: number;
	album?: string;
	rating?: number; // Added rating field
	styles?: string[];
}

export enum MusicGenres {
	Electronic = "Electronic",
	Indie = "Indie",
	Dance = "Dance",
	Alternative = "Alternative",
	Metal = "Metal",
	Rock = "Rock",
	Pop = "Pop",
	HipHop = "Hip-Hop",
	Rap = "Rap",
	IndieRock = "Indie Rock",
	Punk = "Punk",
	StageScreen = "Stage & Screen",
	Reggae = "Reggae",
	FunkSlashSoul = "Funk/Soul",
	Country = "Country",
	World = "World",
	Folk = "Folk",
}

export enum MusicStyles {
	IndieRock = "Indie Rock",
	AlternativeRock = "Alternative Rock",
	HipHop = "Hip-Hop",
	Trap = "Trap",
	DancePop = "Dance-Pop",
	Punk = "Punk",
	Metal = "Metal",
	HardRock = "Hard Rock",
	Rock = "Rock",
	Ragga = "Ragga",
	Pop = "Pop",
	IndiePop = "Indie Pop",
	Indie = "Indie",
	Trance = "Trance",
	House = "House",
	Eurodance = "Eurodance",
	HardHouse = "Hard House",
	HardTrance = "Hard Trance",
	Breaks = "Breaks",
	Electro = "Electro",
	SynthPop = "Synth-Pop",
	IndieSynth = "Indie Synth",
	IndieElectro = "Indie Electro",
	Anison = "Anison",
	Jpop = "J-Pop",
	Soundtrack = "Soundtrack",
	GarageRock = "Garage Rock",
	BigBeat = "Big Beat",
	Ambient = "Ambient",
	Breakbeat = "Breakbeat",
	Downtempo = "Downtempo",
	Rap = "Rap",
	NuMetal = "Nu Metal",
	HeavyMetal = "Heavy Metal",
	ProgRock = "Prog Rock",
	Hardcore = "Hardcore",
	FolkMetal = "Folk Metal",
	PirateMetal = "Pirate Metal",
	PowerMetal = "Power Metal",
	SymphonicMetal = "Symphonic Metal",
	Conscious = "Conscious",
	NeoSoul = "Neo Soul",
	Folk = "Folk",
	FunkMetal = "Funk Metal",
}