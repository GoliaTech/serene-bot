import { findAllCharacters, findCharacter } from "../../../database/dao/character";
import { EmbedColors, I_Command } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";

enum choices {
	"viewall" = "viewall",
	"create" = "create",
	"view" = "view",
	"edit" = "edit"
}

async function viewAllCharacters(userToGet: string) {
	// Returns an ARRAY in data.
	const character = await findAllCharacters(userToGet);
	console.log("character: ", character);
	if (character.error || typeof (character.data) == "string") {
		return {
			data: character.data,
			error: true,
		};
	}

	if (character.data.length == 0 || !character.data) {
		return {
			data: "No character found.",
		};
	}

	// As this is an array we will have to sanitize the whole thing...
	const response: any[] = [];
	for (let i = 0; i < character.data.length; i++) {
		response.push({
			characterid: character.data[i].character_id,
			name: character.data[i].name,
			race: character.data[i].race.name,
			class: character.data[i].class.name,
		});
	}
	return {
		data: response,
	};
}

async function viewCharacter(userToGet: string, characterID: number) {
	// Returns 1 character.
	const character: any = await findCharacter(userToGet, characterID);
	console.log("character: ", character);
	if (character.error) {
		return {
			data: character.data,
			error: true,
		};
	}

	// If we got response that no character was found
	if (!character || !character.data) {
		return {
			data: "No character found.",
		};
	}

	const responseChar = {
		name: character.data.name,
		race: character.data.race.name,
		class: character.data.class.name,
	};

	return {
		data: responseChar,
	};
}

const characterManager: I_Command = {
	data: commandBuilder(
		"charactermgr",
		"View, create, edit your character!",
		{
			dm: true,
			owner: true
		}
	).addStringOption((input) => input
		.setName("choice")
		.setRequired(true)
		.setDescription("View all characters, or choose to view, create or edit 1 character! Input character ID to view 1.")
		.setChoices({ name: "View all", value: "viewall" }, { name: "View", value: "view" }, { name: "Create", value: "create" }, { name: "Edit", value: "edit" })
	).addIntegerOption((input) => input
		.setName("characterid")
		.setDescription("This is only necessary if you want to view/edit/create 1 character.")
		.setMinValue(1).setMaxValue(10)
	),
	async execute(interaction) {
		const embed = embedBuilder("Character manager");
		const choice = interaction.options.getString("choice");
		const characterID = interaction.options.getInteger("characterid");
		console.info(choice);
		console.info(characterID);

		let response;
		let reply: string = "";

		if (choice != choices.viewall && !characterID) {
			embed.setColor(EmbedColors.error).setDescription("You have to input a character ID if you want to view/edit/create 1 character!");
			return interaction.reply({ embeds: [embed] });
		}

		switch (choice) {
			case choices.viewall:
				response = await viewAllCharacters(interaction.user.id);
				if (typeof (response.data) == "string" || response.error) {
					break;
				}

				for (const character in response.data) {
					reply += `**ID:** ${response.data[character].characterid}\n**Name:** ${response.data[character].name}\n**Race:** ${response.data[character].race}\n**Class:** ${response.data[character].class}\n\n`;
				}

				break;

			case choices.create:
				embed.setColor(EmbedColors.warning).setDescription("Still WIP.");
				return interaction.reply({ embeds: [embed] });
			// break;

			case choices.view:
				response = await viewCharacter(interaction.user.id, characterID!);

				if (response.error) {
					break;
				}
				reply += `**Name:** ${response.data.name}\n**Race:** ${response.data.race}\n**Class:** ${response.data.class}`;
				break;

			case choices.edit:
				embed.setColor(EmbedColors.warning).setDescription("Still WIP.");
				return interaction.reply({ embeds: [embed] });
			// break;

			default:
				embed.setColor(EmbedColors.error).setDescription("You haven't picked View, Edit, or Create!");
				return interaction.reply({ embeds: [embed] });
		}

		console.log("response: ", response!);

		if (response!.error) {
			embed.setColor(EmbedColors.error)
				.setDescription(String(response!.data));
			await interaction.reply({ embeds: [embed] });
			return;
		}

		embed.setDescription(reply);
		await interaction.reply({ embeds: [embed] });
		return;
	}
};

module.exports = [
	// createCharacter, getCharacter
	characterManager
];