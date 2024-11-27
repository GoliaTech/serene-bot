import { Events, ModalSubmitInteraction } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";

const modalTest: I_BotEvent = {
	name: Events.InteractionCreate,
	async execute(interaction: ModalSubmitInteraction) {
		if (!interaction.isModalSubmit()) return;

		try {
			const modalID = interaction.customId;

			// Route modals based on their ID
			if (modalID === "dice_roll_modal") {
				const diceAmount = parseInt(interaction.fields.getTextInputValue("dice_amount"));
				const diceSides = parseInt(interaction.fields.getTextInputValue("dice_sides"));
				const diceDisplay = interaction.fields.getTextInputValue("dice_display");

				if (isNaN(diceAmount) || diceAmount < 1 || diceAmount > 20) {
					await interaction.reply({ content: "Invalid dice amount. Please enter a number between 1 and 20.", ephemeral: true });
					return;
				}

				if (isNaN(diceSides) || diceSides < 1 || diceSides > 100) {
					await interaction.reply({ content: "Invalid dice sides. Please enter a number between 1 and 100.", ephemeral: true });
					return;
				}

				const validDisplays = ["list", "sum", "max", "min", "median", "average", "sortascending", "sortdescending", "all"];
				if (!validDisplays.includes(diceDisplay.toLowerCase())) {
					await interaction.reply({ content: "Invalid dice display. Please enter a valid display option.", ephemeral: true });
					return;
				}

				// Generate random rolls.
				// this creates array from the specified amount. The callback function uses randomint from crypto package. +1 is for inclusive max.
				const rolls = Array.from({ length: diceAmount }, () => randomInt(diceSides) + 1);
				const sum = rolls.reduce((total, roll) => total + roll, 0);
				const max = Math.max(...rolls);
				const min = Math.min(...rolls);
				let avg = sum / diceAmount;
				if (avg % 1 < 0.5) {
					avg = Math.floor(avg);
				} else {
					avg = Math.ceil(avg);
				}

				// Median
				const sortedRolls = [...rolls].sort((a, b) => a - b);
				const median = diceAmount % 2 === 0 ? (sortedRolls[diceAmount / 2 - 1] + sortedRolls[diceAmount / 2]) / 2 : sortedRolls[Math.floor(diceAmount / 2)];

				// Display
				const displays: { [key: string]: string; } = {
					list: rolls.join(", "),
					sum: `${sum}`,
					max: `${max}`,
					min: `${min}`,
					average: `${avg}`,
					med: `${median}`,
					sortascending: sortedRolls.join(", "),
					sortdescending: [...sortedRolls].reverse().join(", "),
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

				const result = displays[diceDisplay || "list"] || rolls.join(", ");

				const embed = embedBuilder("Roll")
					.setDescription(String(result));

				await interaction.reply({
					embeds: [embed]
				});
				return;
			}
		} catch (e) {
			console.error(e);
			await interaction.reply({ content: "Something went wrong.", ephemeral: true });
		}
	}
};

module.exports = [modalTest];