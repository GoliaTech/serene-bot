import { I_Command } from "../../../utilities/interface";

const helpCommand: I_Command = {
	data: commandBuilder("help", "Display bot's help."),
	async execute(interaction) {
		return;
	}
};

module.exports = [
	helpCommand
];