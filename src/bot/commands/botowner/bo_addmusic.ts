import { DAO_AddMusic } from "../../../database/dao/music";
import { Music } from "../../../database/entity/music";
import { EmbedColors, I_Command, I_MusicList } from "../../../utilities/interface";
import { commandBuilder, embedBuilder } from "../../misc/builders";

const bo_AddMusic: I_Command = {
	data: commandBuilder(
		"boaddmusic",
		"Add music to the bot.",
		{
			dm: true
		},
	)
		.addStringOption((url) => url
			.setName("ytmusic")
			.setRequired(true)
			.setDescription("URL youtubemusic"))
		.addStringOption((name) => name
			.setName("name")
			.setDescription("Song name")
			.setRequired(true))
		.addStringOption((artist) => artist
			.setName("artist")
			.setDescription("Artist name")
			.setRequired(true))
		.addStringOption((album) => album
			.setName("album")
			.setDescription("Album name")
			.setRequired(false))
		.addStringOption((year) => year
			.setName("year")
			.setDescription("Song year")
			.setRequired(false))
		.addStringOption((genres) => genres
			.setName("genres")
			.setDescription("Comma separated genres")
			.setRequired(false))
		.addStringOption((styles) => styles
			.setName("styles")
			.setDescription("Comma separated styles")
			.setRequired(false))
		.addStringOption((spotify) => spotify
			.setName("spotify")
			.setDescription("Spotify URL")
			.setRequired(false)),
	options: {
		botOwner: true
	},
	async execute(interaction) {
		const embed = embedBuilder("Add Music");
		const ytmusic = interaction.options.getString("ytmusic", true);
		const name = interaction.options.getString("name", true);
		const artist = interaction.options.getString("artist", true);

		let album = interaction.options.getString("album");
		let year = interaction.options.getString("year");
		let genres = interaction.options.getString("genres");
		let styles = interaction.options.getString("styles");
		let spotify = interaction.options.getString("spotify");

		const newSong: I_MusicList = {
			name: name,
			artist: artist,
			ytmusic: ytmusic,
			album: album ? album : undefined,
			year: year ? parseInt(year) : undefined,
			genre: genres ? genres.split(",") : undefined,
			styles: styles ? styles.split(",") : undefined,
			spotify: spotify ? spotify : undefined,
		};

		const feedback = validateSongs(newSong);

		let reply = "";
		const songs: I_MusicList[] = [];
		songs.push(newSong);
		try {
			await DAO_AddMusic(songs);
			reply = "Song added!";
			if (feedback) {
				reply += `\n${feedback}`;
			}
			embed.setDescription(reply).setColor(EmbedColors.success);
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		} catch (error: any) {
			reply = "Error adding song.";
			if (feedback) {
				reply += `\n${feedback}\n${error.message}`;
			}
			embed.setDescription(reply).setColor(EmbedColors.error);
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}
	},
};

// Helper to validate songs
function validateSongs(song: I_MusicList): string {
	let feedback = "";
	if (!song.spotify) {
		const text = `Spotify link is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.year) {
		const text = `Year is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.album || !song.album) {
		const text = `Album is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.genre || song.genre.length > 0) {
		const text = `Genres are missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.styles || song.styles.length > 0) {
		const text = `Styles are missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	return feedback;
}

module.exports = [
	bo_AddMusic
];