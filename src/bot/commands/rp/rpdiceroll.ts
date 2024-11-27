import { randomInt } from "crypto";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";

const rpdiceroll: I_Command = {
	data: commandBuilder(
		"rpdiceroll",
		"Roll thy dice. Customize the number of dice, sides, and display.",
		{
			dm: false
		}
	)
		.addIntegerOption((amount) => amount
			.setName("amount")
			.setDescription("How many dice do you want to roll?")
			.setMaxValue(20)
			.setMinValue(1)
			.setRequired(true))
		.addIntegerOption((sides) => sides
			.setName("sides")
			.setDescription("How many sides does each die have?")
			.setChoices(
				{ name: "2", value: 2 },
				{ name: "3", value: 3 },
				{ name: "4", value: 4 },
				{ name: "6", value: 6 },
				{ name: "8", value: 8 },
				{ name: "10", value: 10 },
				{ name: "12", value: 12 },
				{ name: "20", value: 20 },
				{ name: "40", value: 40 },
				{ name: "50", value: 50 },
				{ name: "60", value: 60 },
				{ name: "100", value: 100 },
			)
			.setRequired(true))
		.addStringOption((method) => method
			.setName("display")
			.setDescription("Customise how results are displayed.")
			.setChoices(
				{ name: "List (default)", value: "list" },
				{ name: "Sum", value: "sum" },
				{ name: "Highest", value: "max" },
				{ name: "Lowest", value: "min" },
				{ name: "Average", value: "avg" },
				{ name: "Median", value: "med" },
				{ name: "Ascending", value: "sortasc" },
				{ name: "Descending", value: "sortdesc" },
				{ name: "All", value: "all" }
			)),
	/**
	 * The execute function for the rpcreate command.
	 * @param interaction The interaction that triggered this command.
	 */
	async execute(interaction) {
		const amount = interaction.options.getInteger("amount")!;
		const sides = interaction.options.getInteger("sides")!;
		const display = interaction.options.getString("display")!;

		if (!amount || !sides) {
			await interaction.reply({ content: "You have to choose a number of dice and sides.", ephemeral: true });
			return;
		}

		// Generate random rolls.
		// this creates array from the specified amount. The callback function uses randomint from crypto package. +1 is for inclusive max.
		const rolls = Array.from({ length: amount }, () => randomInt(sides) + 1);
		const sum = rolls.reduce((total, roll) => total + roll, 0);
		const max = Math.max(...rolls);
		const min = Math.min(...rolls);
		let avg = sum / amount;
		if (avg % 1 < 0.5) {
			avg = Math.floor(avg);
		} else {
			avg = Math.ceil(avg);
		}

		// Median
		const sortedRolls = [...rolls].sort((a, b) => a - b);
		const median = amount % 2 === 0 ? (sortedRolls[amount / 2 - 1] + sortedRolls[amount / 2]) / 2 : sortedRolls[Math.floor(amount / 2)];

		// Display
		const displays: { [key: string]: string; } = {
			list: rolls.join(", "),
			sum: `${sum}`,
			max: `${max}`,
			min: `${min}`,
			avg: `${avg}`,
			med: `${median}`,
			sortasc: sortedRolls.join(", "),
			sortdesc: [...sortedRolls].reverse().join(", "),
			all: `
        	Rolls: ${rolls.join(", ")}
        	Ascending: ${sortedRolls.join(", ")}
        	Descending: ${[...sortedRolls].reverse().join(", ")}
        	Sum: ${sum}
        	Highest: ${max}
        	Lowest: ${min}
        	Average: ${avg}
        	Median: ${median}
      		`,
		};

		const result = displays[display || "list"] || rolls.join(", ");

		const embed = embedBuilder("Roll")
			.setDescription(String(result));

		await interaction.reply({
			embeds: [embed]
		});
		return;
	}
};

module.exports = [
	rpdiceroll
];

// At the moment this is not very interactive, because I just wanted something done.
// I can later upgrade it to a more interactive thing.;