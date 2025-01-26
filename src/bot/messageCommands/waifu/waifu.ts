import { AppDataSource } from "../../../database/datasource";           // import your data source
import { Waifu } from "../../../database/entity";
import { getRandomWaifu, getAllRelevantImages } from "../../misc/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from "discord.js";
import { embedBuilder } from "../../misc/builders";
import { createFakeTinderCard } from "../../misc/waifuThing";
import { I_MessageCommand } from "../../../utilities/interface";

const waifuCommand: I_MessageCommand = {
	data: {
		name: "waifu"
	},
	async execute(interaction: Message) {
		try {
			// 1) Get the repository
			const waifuRepo = AppDataSource.getRepository(Waifu.Core);

			// 2) Fetch a random waifu
			const waifu = await getRandomWaifu(waifuRepo);

			// 3) Determine if the channel is NSFW
			const channel = interaction.channel as TextChannel;
			const isChannelNSFW = channel?.nsfw ?? false;
			console.log(isChannelNSFW);

			// 4) Gather images
			const images = getAllRelevantImages(waifu, isChannelNSFW);
			if (images.length === 0) {
				await interaction.reply(
					"No images found for this waifu. Please check your image folders."
				);
				return;
			}

			// Start at index 0
			let currentIndex = 0;
			const currentImagePath = images[currentIndex];
			console.log(currentImagePath);

			// 5) Create the Tinder‐like composite
			const compositeImageBuffer = await createFakeTinderCard(currentImagePath, waifu, 2, 10);

			// 6) Build an embed
			const embed = new EmbedBuilder()
				.setColor("Random")
				.setTitle(`Meet ${waifu.name}!`)
				.setImage("attachment://waifu.png");

			// 7) Build the action row with 4 buttons
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`waifu_dislike_${waifu.id}_${currentIndex}`)
					.setLabel("Dislike")
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId(`waifu_like_${waifu.id}_${currentIndex}`)
					.setLabel("Like")
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`waifu_prev_${waifu.id}_${currentIndex}`)
					.setLabel("Previous")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentIndex === 0),
				new ButtonBuilder()
					.setCustomId(`waifu_next_${waifu.id}_${currentIndex}`)
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentIndex === images.length - 1)
			);

			// 8) Reply with embed + attached image
			await interaction.reply({
				embeds: [embed],
				files: [{ attachment: compositeImageBuffer, name: "waifu.png" }],
				components: [row],
			});
		} catch (error) {
			console.error("Error in /waifu command:", error);
			await interaction.reply(
				"Something went wrong fetching a waifu. Please try again later."
			);
		}
	},
};

module.exports = [waifuCommand]