import { Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { interactionCommands, loadedEvents } from "../../bot";
import { I_MessageCommand, MusicGenres, MusicStyles } from "../../../utilities/interface";

const ping: I_MessageCommand = {
	data: {
		name: "genrelist"
	},
	options: {
		botOwner: true,
	},
	async execute(message: Message) {
		interactionCommands;
		loadedEvents;

		const genreList: string[] = [];
		const styleList: string[] = [];

		Object.values(MusicGenres).forEach((genre) => {
			genreList.push(genre);
		});

		Object.values(MusicStyles).forEach((style) => {
			styleList.push(style);
		});

		message.reply({ content: `**Genres:**\n${genreList.join(", ")}\n\n**Styles:**\n${styleList.join(", ")}`, options: { ephemeral: true } });
		return;
	}
};

module.exports = [
	ping
];