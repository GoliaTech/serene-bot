import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const rpBackstory: I_Command = {
	data: commandBuilder(
		"rpbackstory",
		"Create your character. You can read more about races and naming conventions on the wiki.",
		{
			dm: true
		}
	)
		.addStringOption((backstory) => backstory
			.setName("backstory")
			.setRequired(true)
			.setMinLength(30)
			.setDescription("Give your character a backstory. Make it in theme with the current roleplay!")),
	options: {
		botOwner: true,
	},
	/**
	 * The execute function for the rpcreate command.
	 * @param interaction The interaction that triggered this command.
	 */
	async execute(interaction) {
		// choosing the race.
		let backstory = interaction.options.getString("backstory");
		if (!backstory) {
			await interaction.reply({ content: "You have to give your character a backstory.", ephemeral: true });
			return;
		}
		if (backstory.length < 30) {
			await interaction.reply({ content: "Your backstory needs to be at least 30 characters long.", ephemeral: true });
			return;
		}

		// end of command
		await interaction.reply({
			content: `Your backstory:
			${backstory}`, ephemeral: true
		});
		return;
	}
};

module.exports = [
	rpBackstory
];