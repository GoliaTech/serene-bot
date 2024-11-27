import {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	CommandInteraction
} from "discord.js";
import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const rpCreate: I_Command = {
	data: commandBuilder(
		"rpdicerolltwo",
		"Interactive dice roller using modals.",
	),

	async execute(interaction: CommandInteraction) {
		const modal = new ModalBuilder()
			.setCustomId("dice_roll_modal")
			.setTitle("Configure Your Dice Roll");

		// Text input for dice amount
		const diceAmountInput = new TextInputBuilder()
			.setCustomId("dice_amount")
			.setLabel("How many dice do you want to roll? (1-20)")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter a number between 1 and 20")
			.setRequired(true);

		// Text input for dice sides
		const diceSidesInput = new TextInputBuilder()
			.setCustomId("dice_sides")
			.setLabel("How many sides does each die have? (2-100)")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter a number between 2 and 100")
			.setRequired(true);

		// Text input for display method
		const displayMethodInput = new TextInputBuilder()
			.setCustomId("dice_display")
			.setLabel("Default: List, otherwise choose different.")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Options: list, sum, max, min, average, median, sortascending, sortdescending, all")
			.setRequired(false);

		// Add inputs to modal
		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(diceAmountInput),
			new ActionRowBuilder<TextInputBuilder>().addComponents(diceSidesInput),
			new ActionRowBuilder<TextInputBuilder>().addComponents(displayMethodInput)
		);

		// Show the modal to the user
		await interaction.showModal(modal);
	},
};

module.exports = [rpCreate];