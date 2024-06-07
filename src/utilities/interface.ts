import { Collection, CommandInteraction } from "discord.js";

export interface CommandInteractionExtended extends CommandInteraction {
	interaction: {
		client: {
			commands: Collection<string, any>;
		};
	};
}

export interface Localization {
	name: LocalizationNameDescription;
	description: LocalizationNameDescription;
}

export interface LocalizationNameDescription {
	"en-GB"?: string;
	"en-US"?: string;
	bg?: string,
	cs?: string,
	da?: string,
	de?: string,
	el?: string,
	"es-ES"?: string,
	"es-419"?: string,
	fi?: string,
	fr?: string,
	hu?: string,
	it?: string,
	ja?: string,
	ko?: string,
	nl?: string,
	no?: string,
	pl?: string,
	"pt-BR"?: string,
	ro?: string,
	ru?: string,
	"sv-SE"?: string,
	tr?: string,
	uk?: string,
	"zh-CN"?: string,
	"zh-TW"?: string,
	vi?: string,
	hi?: string,
	id?: string,
	hr?: string,
}