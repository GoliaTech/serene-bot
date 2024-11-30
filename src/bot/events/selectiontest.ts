import { ChannelType, Events, StringSelectMenuInteraction, ButtonInteraction } from "discord.js";
import { I_BotEvent } from "../../utilities/interface";
import { embedBuilder } from "../misc/builders";
import { randomInt } from "crypto";

// const modalTest: I_BotEvent = {
// 	name: Events.InteractionCreate,
// 	async execute(interaction: StringSelectMenuInteraction) {
// 		if (!interaction.isStringSelectMenu()) return;

// 		if (interaction.customId === "gender_select") {
// 			interaction.reply({ content: `Gender selected: ${interaction.values[0]}`, ephemeral: true });
// 		}

// 		if (interaction.customId === "race_select") {
// 			interaction.reply({ content: `Race selected: ${interaction.values[0]}`, ephemeral: true });
// 			const race = interaction.values[0];

// 			const channel = await interaction.guild?.channels.fetch("759703189564948530");
// 			if (!channel) {
// 				interaction.reply({ content: `Channel not found`, ephemeral: true });
// 				return;
// 			}
// 			if (channel.type !== ChannelType.GuildText) {
// 				interaction.reply({ content: `Channel is not a text channel`, ephemeral: true });
// 				return;
// 			}
// 			const thread = await channel.threads.create({
// 				name: `${interaction.user.username}-character-creation`,
// 				type: ChannelType.PrivateThread,
// 				invitable: false,
// 				autoArchiveDuration: 60,
// 			});

// 			await thread.members.add(interaction.user.id);

// 			let introductionMessage = "";
// 			switch (race) {
// 				case "dragon":
// 					introductionMessage = "welcome, the dragons are gay";
// 					break;
// 				default:
// 					introductionMessage = "Welcoem! You suck cox";
// 			}

// 			await thread.send(introductionMessage);

// 			// sequential prompts.
// 			const askName = async (question: any) => {
// 				await thread.send(question);
// 				const collector = thread.createMessageCollector({
// 					filter: (m) => m.author.id === interaction.user.id,
// 					time: 60 * 1000 * 2,
// 					max: 1,
// 				});

// 				return new Promise((resolve, reject) => {
// 					collector.on("collect", (message) => {
// 						const input = message.content.trim();
// 						if (input.split(/\s+/).length === 1) {
// 							resolve(input);
// 						} else {
// 							thread.send("invalid input, please provide a single word");
// 							reject("Invalid input");
// 						}
// 					});

// 					collector.on("end", (collected, reason) => {
// 						if (reason === "time") {
// 							thread.send("You took too long to respond");
// 							reject("Timeout");
// 						}
// 					});
// 				});
// 			};

// 			try {
// 				const firstName = await askName("What is your first name?");
// 				const familyName = await askName("What is your family name?");
// 				const lineageName = await askName("What is your lineage name?");

// 				// confirm inputs
// 				const characterDetails = `**Character Details:**\nFirst Name: ${firstName}\nFamily Name: ${familyName}\nLineage Name: ${lineageName}\nGender: ${interaction.values[0]}\nRace: ${race}`;
// 				await thread.send(characterDetails);

// 				thread.send("Next we'll ask about your sub-race");
// 			} catch (e) {
// 				console.error(e);
// 				thread.delete();
// 			}

// 		}

// 	}
// };

const buttonTest: I_BotEvent = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return;
		if (interaction.customId === "rp_create_ok") {
			console.log("BUtton ok pressed");
			return;
		} else if (interaction.customId === "rp_create_cancel") {
			console.log("BUtton cancel pressed");
			return;
		}
	}
};

module.exports = [buttonTest];