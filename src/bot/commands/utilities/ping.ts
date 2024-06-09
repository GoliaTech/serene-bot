import path from "path";
import { commandBuilder } from "../../misc/commandBuilder";
import { Command } from "../../../utilities/interface";

function ping() {
	console.log("pong");
}

const command: Command = {
	data: commandBuilder(
		"ping",
		"Ping!"
	),
	async execute(interaction) {
		ping();
		interaction.reply({ content: "I have ponged" });
	},
};

const pong: Command = {
	data: commandBuilder(
		"pong",
		"Pong!"
	),
	async execute(interaction) {
		interaction.reply({ content: "I have pinged" });
	},
};

module.exports = [
	command,
	pong,
];
