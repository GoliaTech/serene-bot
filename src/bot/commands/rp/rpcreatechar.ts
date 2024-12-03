import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, StringSelectMenuBuilder } from "discord.js";
import { I_Command, I_OtherCommand } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const rpCreate: I_Command = {
	data: commandBuilder(
		"rpcreatechar",
		"Create your character. You can read more about races and naming conventions on the wiki.",
		{
			dm: true
		}
	),
	/**
	 * The execute function for the rpcreate command.
	 * @param interaction The interaction that triggered this command.
	 */
	async execute(interaction: any) {
		const genderSelect = new StringSelectMenuBuilder()
			.setCustomId("rp_gender_select")
			.setPlaceholder("Select your gender")
			.setOptions([
				{ label: "Male", value: "male" },
				{ label: "Female", value: "female" },
				{ label: "Non-binary", value: "non_binary" },
			]);

		const raceSelect = new StringSelectMenuBuilder()
			.setCustomId("rp_race_select")
			.setPlaceholder("Select your race")
			.setOptions([
				{ label: "Human", value: "human" },
				{ label: "Dracon - biped", value: "draconbiped" },
				{ label: "Slithean - biped", value: "slitheanbiped" },
				{ label: "Wolf", value: "wolf" },
				{ label: "Fox", value: "fox" },
				{ label: "Deer", value: "deer" },
				{ label: "Equine - alicorn", value: "alicorn" },
				{ label: "Equine - unicorn", value: "unicorn" },
				{ label: "Equine - pegasus", value: "pegasus" },
				{ label: "Equine", value: "equine" },
				{ label: "Fyriian", value: "fyriian" },
			]);

		const buttonOK = new ButtonBuilder()
			.setCustomId("rp_create_ok")
			.setLabel("OK")
			.setStyle(ButtonStyle.Success);

		const buttonCancel = new ButtonBuilder()
			.setCustomId("rp_create_cancel")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Danger);

		const genderRow = new ActionRowBuilder().addComponents(genderSelect);
		const raceRow = new ActionRowBuilder().addComponents(raceSelect);
		const buttonRow = new ActionRowBuilder().addComponents(buttonOK, buttonCancel);

		await interaction.reply({
			components: [genderRow, raceRow, buttonRow],
			content: "Select your gender and race.",
			ephemeral: true
		});
	}
};

module.exports = [
	rpCreate,
];