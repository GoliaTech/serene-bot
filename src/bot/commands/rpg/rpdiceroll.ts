import { randomInt } from "crypto";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const rpCreate: I_Command = {
	data: commandBuilder(
		"rpdiceroll",
		"Roll thy dice. By default it will just list the die. Use optional argument to adjust results.",
		{
			dm: false
		}
	)
		.addIntegerOption((amount) => amount
			.setName("amount")
			.setDescription("How many die you want to roll?")
			.setMaxValue(20)
			.setMinValue(1)
			.setRequired(true))
		.addIntegerOption((sides) => sides
			.setName("sides")
			.setDescription("Amount of sides the die has.")
			.setChoices(
				{ name: "2", value: 2 },
				{ name: "3", value: 3 },
				{ name: "4", value: 4 },
				{ name: "6", value: 6 },
				{ name: "8", value: 8 },
				{ name: "10", value: 10 },
				{ name: "12", value: 12 },
				{ name: "20", value: 20 },
				{ name: "50", value: 50 },
				{ name: "100", value: 100 },
			)
			.setRequired(true))
		.addStringOption((method) => method
			.setName("display")
			.setDescription("If you'd like to display different result, adjust it here.")
			.setChoices(
				{ name: "List", value: "list" },
				{ name: "Sum", value: "sum" },
				{ name: "Highest", value: "max" },
				{ name: "Lowest", value: "min" },
				{ name: "Average", value: "avg" },
				{ name: "All", value: "all" }
			)),
	/**
	 * The execute function for the rpcreate command.
	 * @param interaction The interaction that triggered this command.
	 */
	async execute(interaction) {
		// choosing the race.
		let amount = interaction.options.getInteger("amount");
		let sides = interaction.options.getInteger("sides");

		if (!amount || !sides) {
			await interaction.reply({ content: "You have to choose a thing.", ephemeral: true });
			return;
		}

		const table = [];
		for (let i = 0; i < amount; i++) {
			const result = randomInt(1, sides);
			table.push(result);
		}

		const sum = table.reduce((a, b) => a + b, 0);

		const max = Math.max(...table);
		const min = Math.min(...table);

		let average = sum / amount;
		if (average % 1 < 0.5) {
			average = Math.floor(average);
		} else {
			average = Math.ceil(average);
		}

		let display = interaction.options.getString("display");
		let result = "";
		if (!display || display == "list") {
			result = table.join(", ");
		} else if (display == "sum") {
			result = String(sum);
		} else if (display == "max") {
			result = String(max);
		} else if (display == "min") {
			result = String(min);
		} else if (display == "avg") {
			result = String(average);
		} else if (display == "all") {
			result = `${table.join(", ")}\nSum: ${sum}\nMax: ${max}\nMin: ${min}\nAverage: ${average}`;
		} else {
			result = table.join(", ");
		}

		// end of command
		await interaction.reply({
			content: result, ephemeral: true
		});
		return;
	}
};

module.exports = [
	rpCreate
];

// At the moment this is not very interactive, because I just wanted something done.
// I can later upgrade it to a more interactive thing.