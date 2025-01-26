import { Music } from "../../database/entity/music";
import { Waifu } from "../../database/entity"
import { Repository } from "typeorm";
import { embedBuilder } from "./builders";
import fs from "fs";
import path from "path";
import Canvas from "canvas";
import { CanvasTextWrapper } from "canvas-text-wrapper";

function convertYouTubeMusicLinkToThumbnail(link: string) {
	// Extract the video ID from the YouTube Music URL
	const url = new URL(link); // Parse the URL
	const videoId = url.searchParams.get('v'); // Get the value of the 'v' parameter

	if (!videoId) {
		throw new Error("Invalid YouTube Music link");
	}

	// Construct the thumbnail URL
	const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

	return thumbnailUrl;
}

// Helper to build embed
export function buildMusicEmbed(song: Music, title?: string) {
	const embed = embedBuilder(title ? title : "Music Suggestion")
		.setDescription("Check out this song I found in my music collection!\nGenres and styles from: https://discogs.com/\nhttps://musicbrainz.org/")
		.addFields(
			{ name: "Name", value: song.name, inline: true },
			{ name: "Artist", value: song.artist.name, inline: true }
		)
		.setImage(convertYouTubeMusicLinkToThumbnail(song.ytmusic));

	if (song.genres && song.genres.length > 0) {
		embed.addFields({
			name: "Genre",
			value: song.genres.map((genre) => genre.name).join(", "),
			inline: true,
		});
	}
	if (song.styles && song.styles.length > 0) {
		embed.addFields({
			name: "Style",
			value: song.styles.map((style) => style.name).join(", "),
			inline: true,
		});
	}
	if (song.year) embed.addFields({ name: "Year", value: String(song.year), inline: true });
	if (song.album) embed.addFields({ name: "Album", value: song.album.name, inline: true });
	embed.addFields({ name: "YouTube Music", value: song.ytmusic });
	if (song.spotify) embed.addFields({ name: "Spotify", value: song.spotify });
	embed.addFields({ name: "User Rating", value: String(song.rating) });

	return embed;
}

/**
 * Returns a random waifu from the database
 */
export async function getRandomWaifu(waifuRepo: Repository<Waifu.Core>): Promise<Waifu.Core> {
	const count = await waifuRepo.count();
	if (count === 0) {
		throw new Error("No waifus in the database!");
	}
	const randomOffset = Math.floor(Math.random() * count);

	// pick one waifu at random
	const [waifu] = await waifuRepo.find({
		skip: randomOffset,
		take: 1,
	});
	console.log(waifu);
	return waifu;
}

/**
 * Utility to get image file paths from a folder
 */
function getImagesFromFolder(folderPath: string): string[] {
	try {
		return fs
			.readdirSync(folderPath)
			.filter((file) => file.match(/\.(png|jpe?g|gif)$/i))
			.map((file) => path.join(folderPath, file));
	} catch (err) {
		// folder might not exist
		return [];
	}
}

/**
 * Returns an array of file paths (SFW images, and NSFW if channel is NSFW)
 */
export function getAllRelevantImages(waifu: Waifu.Core, isChannelNSFW: boolean): string[] {
	// const sfwImages = getImagesFromFolder(waifu.imgpath);
	if (!isChannelNSFW) {
		const sfwImages = getImagesFromFolder(waifu.imgpath);
		console.log("THIS IS SFW CHANNEL")
		return sfwImages;
	} else {
		console.log("THIS IS NSFW CHANNEL")
		const nsfwImages = getImagesFromFolder(waifu.nsfwImgpath);
		// return [...sfwImages, ...nsfwImages];
		return nsfwImages
	}
}
