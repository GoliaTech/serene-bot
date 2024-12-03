import { Message } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { interactionCommands, loadedEvents } from "../../bot";
import { I_MessageCommand } from "../../../utilities/interface";

const ping: I_MessageCommand = {
	data: {
		name: "disabled"
	},
	async execute(message: Message) {
		interactionCommands;
		loadedEvents;

		if (!loadedEvents) {
			message.reply({ content: "No events loaded." });
			return;
		}
		if (!interactionCommands) {
			message.reply({ content: "No commands loaded." });
			return;
		}
		message.reply({ content: `Disabled events: ${loadedEvents.map((e) => e.name).join(", ")}\nDisabled commands: ${interactionCommands.map((e) => e.data.name).join(", ")}` });
		return;
	}
};

module.exports = [
	ping
];