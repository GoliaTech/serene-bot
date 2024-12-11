import { writeFile, writeFileSync } from "fs";
import { EmbedColors, I_Command, I_secretsanta } from "../../../utilities/interface";
import { logError } from "../../../utilities/utilities";
import { commandBuilder, embedBuilder } from "../../misc/builders";
import path from "path";
import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, Collection, orderedList } from "discord.js";
import { overwriteSanta } from "../../bot";

// for deplloying....
// const overwriteSanta = new Collection<string, I_secretsanta>();

function santaConstructor(id: string, likes: string, dislikes: string, funfact: string, emergencysanta: boolean): I_secretsanta {

	// we have to spread the likes, dislikes...
	const likesArray = likes.split(', ');
	const dislikesArray = dislikes.split(', ');

	const santa: I_secretsanta = {
		id: id,
		likes: likesArray,
		dislikes: dislikesArray,
		funnyfaq: funfact,
		emergencysanta: emergencysanta
	};
	return santa;
}

const secretsanta: I_Command = {
	data: commandBuilder(
		"secretsanta",
		"Use this to add yourself to secret santa!",
		{
			dm: true
		}
	)
		.addStringOption(input => input
			.setName("likes")
			.setDescription("Separate your likes with comma: cat, taking baths, dog")
			.setMaxLength(320)
			.setRequired(true)
		)
		.addStringOption(input => input
			.setName("dislikes")
			.setDescription("Separate your dislikes with comma: cat, taking baths, dog")
			.setMaxLength(320)
			.setRequired(true)
		)
		.addStringOption(input => input
			.setName("funfact")
			.setDescription("Add a fun or interesting fact about yourself.")
			.setRequired(true)
			.setMaxLength(1024)
		)
		.addBooleanOption(input => input
			.setName("emergencysanta")
			.setDescription("In case someone doesn't get their present, are you available")
			.setRequired(true)
		),
	options: {
		disabled: true
	},
	async execute(interaction) {
		// Get variables.
		const likes = interaction.options.getString("likes", true);
		const dislikes = interaction.options.getString("dislikes", true);
		const funfact = interaction.options.getString("funfact", true);
		const emergencysanta = interaction.options.getBoolean("emergencysanta", true);

		// Load the secretsanta list.
		const secretsantapath = path.resolve(__dirname, "../../../../secretsanta.json");
		let secretSantaList: I_secretsanta[] = require(secretsantapath)["secretsanta"];

		// build a skeleton embed to be used when needed.
		const embed = embedBuilder("Secret Santa");

		// Construct a new santa, which returns:
		/*
			id: string;
			likes: string[];
			dislikes: string[];
			funnyfaq: string;
			emergencysanta: boolean;
		*/
		const santa = santaConstructor(interaction.user.id, likes, dislikes, funfact, emergencysanta);

		// Check if our santa is on the list.
		for (const santaIn of secretSantaList) {
			if (santaIn.id === interaction.user.id) {
				embed.setColor(EmbedColors.default).setDescription(`
					### You are already on the list!
					**Current entry:**
					**Likes:** ${santaIn.likes.join(", ")}
					**Dislikes:** ${santaIn.dislikes.join(", ")}	
					**Fun Fact:** ${santaIn.funnyfaq}
					**Emergency Santa:** ${santaIn.emergencysanta ? "Yes" : "No"}
					
					__Do you wish to overwrite with:__
					**Likes:** ${santa.likes.join(", ")}
					**Dislikes:** ${santa.dislikes.join(", ")}	
					**Fun Fact:** ${santa.funnyfaq}
					**Emergency Santa:** ${santa.emergencysanta ? "Yes" : "No"}`);

				// add user to global temporary santa list
				overwriteSanta.set(interaction.user.id, santa);
				console.log(overwriteSanta);

				// add overwrite button.
				const button = new ButtonBuilder()
					.setCustomId(`overwrite_santa|${interaction.user.id}`)
					.setLabel("Overwrite")
					.setStyle(ButtonStyle.Success);

				// add cancel button
				const cancelButton = new ButtonBuilder()
					.setCustomId(`santa_cancel_overwrite|${interaction.user.id}`)
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger);

				// add action row with buttons
				const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button, cancelButton);

				// return the reply to the user.
				interaction.reply({ embeds: [embed], ephemeral: true, components: [actionRow] });

				try {
					delete require.cache[require.resolve(secretsantapath)];
					return;
				} catch (err: any) {
					logError(err.message);
					return;
				}
			}
		}

		// write to the file with new santa.
		secretSantaList.push(santa);
		const json = JSON.stringify({ secretsanta: secretSantaList }, null, 2);

		try {
			// Use writeFile instead of writeFileSync.
			writeFileSync(secretsantapath, json, "utf8");
			// Reply that you are added.
			embed.setColor(EmbedColors.success).setDescription("You are now on the list!");
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
		catch (e) {
			console.error("failed to write file", e);
			embed.setColor(EmbedColors.error).setDescription("Something went wrong whilst trying to save you in the file... Contact the developer.");
			interaction.reply({ embeds: [embed], ephemeral: true });
		}

		// clear the json file that has been loaded.
		try {
			delete require.cache[require.resolve(secretsantapath)];
			return;
		} catch (err: any) {
			logError(err.message);
			return;
		}
	}
};

module.exports = [
	secretsanta
];