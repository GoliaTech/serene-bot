import { I_Command } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

const races = [
	{ name: "Human", value: "human" },
	{ name: "Lustrovormir", value: "lustrovormir" },
	{ name: "Dracon - biped", value: "draconbiped" },
	{ name: "Slithean - biped", value: "slitheanbiped" },
	{ name: "Wolf", value: "wolf" },
	{ name: "Fox", value: "fox" },
	{ name: "Deer", value: "deer" },
	{ name: "Equine - alicorn", value: "alicorn" },
	{ name: "Equine - unicorn", value: "unicorn" },
	{ name: "Equine - pegasus", value: "pegasus" },
	{ name: "Equine", value: "equine" },
	{ name: "Fyriian", value: "fyriian" },
];

const rpCreate: I_Command = {
	data: commandBuilder(
		"rpcreate",
		"Create your character. You can read more about races and naming conventions on the wiki.",
		{
			dm: true
		}
	)
		.addStringOption((firstname) => firstname
			.setName("firstname")
			.setRequired(true)
			.setDescription("Set your character's first name.")
			.setMinLength(3)
			.setMaxLength(30))
		.addStringOption((familyname) => familyname
			.setName("familyname")
			.setRequired(true)
			.setDescription("If the family is ruled by a female, please end in a feminine suffix: -a, -i, etc.")
			.setMinLength(3)
			.setMaxLength(30))
		.addStringOption((lineagename) => lineagename
			.setName("lineagename")
			.setRequired(true)
			.setDescription("If the lineage was started by a female, please end in a feminine suffix: -a, -i, etc.")
			.setMinLength(3)
			.setMaxLength(30))
		.addStringOption((gender) => gender
			.setName("gender")
			.setDescription("Are you a boy, a girl, or they/them?")
			.setRequired(true)
			.setChoices({ name: "Male", value: "male" }, { name: "Female", value: "female" }, { name: "They/Them", value: "theythem" }))
		.addStringOption((race) => race
			.setName("race")
			.setRequired(true)
			.setDescription("Choose a race you wish to play. Read more about them and their stats on the wiki.")
			.setChoices(
				{ name: "Random", value: "random" },
				{ name: "Human", value: "human" },
				{ name: "Lustrovormir", value: "lustrovormir" },
				{ name: "Dracon - biped", value: "draconbiped" },
				{ name: "Slithean - biped", value: "slitheanbiped" },
				{ name: "Wolf", value: "wolf" },
				{ name: "Fox", value: "fox" },
				{ name: "Deer", value: "deer" },
				{ name: "Equine - alicorn", value: "alicorn" },
				{ name: "Equine - unicorn", value: "unicorn" },
				{ name: "Equine - pegasus", value: "pegasus" },
				{ name: "Equine", value: "equine" },
				{ name: "Fyriian", value: "fyriian" },
			)),
	options: {
		botOwner: true,
	},
	/**
	 * The execute function for the rpcreate command.
	 * @param interaction The interaction that triggered this command.
	 */
	async execute(interaction) {
		// choosing the race.
		let firstname = interaction.options.getString("firstname");
		let familyname = interaction.options.getString("familyname");
		let lineagename = interaction.options.getString("lineagename");
		let gender = interaction.options.getString("gender");
		let race = interaction.options.getString("race");

		if (!firstname) {
			await interaction.reply({ content: "You have to give your character a name.", ephemeral: true });
			return;
		}
		if (!familyname) {
			await interaction.reply({ content: "You have to give your character a family name.", ephemeral: true });
			return;
		}
		if (!lineagename) {
			await interaction.reply({ content: "You have to give your character a lineage name.", ephemeral: true });
			return;
		}
		if (!gender) {
			await interaction.reply({ content: "You have to choose a gender.", ephemeral: true });
			return;
		}
		if (!race) {
			await interaction.reply({ content: "You have to choose a race.", ephemeral: true });
			return;
		}

		if (race === "random") {
			const randomRace = races[Math.floor(Math.random() * races.length)];
			race = randomRace.value;
		}

		let fullname = "";
		if (race == "draconbiped") {
			fullname = `${firstname}-${familyname}'${lineagename}`;
		}

		// end of command
		await interaction.reply({
			content: `Your character:
			Name: ${firstname}
			Family name: ${familyname}
			Lineage name: ${lineagename}
			Full name: ${fullname}
			Gender: ${gender}
			Race: ${race}`, ephemeral: true
		});
		return;
	}
};

module.exports = [
	rpCreate
];

// At the moment this is not very interactive, because I just wanted something done.
// I can later upgrade it to a more interactive thing.