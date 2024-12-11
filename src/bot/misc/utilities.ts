import { Music } from "../../database/entity/music";
import { embedBuilder } from "./builders";

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
