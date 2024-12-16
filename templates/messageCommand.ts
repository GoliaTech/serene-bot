import { I_MessageCommand } from "../../../utilities/interface";

const ping: I_MessageCommand = {
	data: {
		name: "ping"
	},
	async execute(message: Message) {
		return;
	}
};

module.exports = [
	ping
];