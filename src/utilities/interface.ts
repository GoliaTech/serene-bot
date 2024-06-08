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
	"es-ES"?: string;
	"es-419"?: string;
	"pt-BR"?: string;
	"zh-CN"?: string;
	"zh-TW"?: string;
	"sv-SE"?: string;
	bg?: string;
	cs?: string;
	da?: string;
	de?: string;
	el?: string;
	fi?: string;
	fr?: string;
	hu?: string;
	it?: string;
	ja?: string;
	ko?: string;
	nl?: string;
	no?: string;
	pl?: string;
	ro?: string;
	ru?: string;
	tr?: string;
	uk?: string;
	vi?: string;
	hi?: string;
	id?: string;
	hr?: string;
}
export interface localizedDescription2 {
	name: Locale;
	description: Locale;
}
type Locale = "en-GB" | "en-US" | "es-ES" | "es-419" | "pt-BR" | "zh-CN" | "zh-TW" | "sv-SE" | "bg" | "cs" | "da" | "de" | "el" | "fi" | "fr" | "hu" | "it" | "ja" | "ko" | "nl" | "no" | "pl" | "ro" | "ru" | "tr" | "uk" | "vi" | "hi" | "id" | "hr";