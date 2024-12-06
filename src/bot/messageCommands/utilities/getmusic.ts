import { I_MessageCommand } from "../../../utilities/interface";

const getMusic: I_MessageCommand = {
	data: {
		name: "getmusic"
	},
	async execute(message, args) {

	},
};

module.exports = [
	getMusic
];