import { DAO_AddMusic } from "../../../database/dao/music";
import { EmbedColors, I_Command, I_MusicList, MusicGenres, MusicStyles } from "../../../utilities/interface";
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
		// Create a new embed
		const embed = embedBuilder("Add Music");

		// Get the options that we know for sure are going to be there.
		const ytmusic = interaction.options.getString("ytmusic", true);
		const name = interaction.options.getString("name", true);
		const artist = interaction.options.getString("artist", true);

		// Get the options that we don't know for sure are going to be there.
		let album = interaction.options.getString("album");
		let year = interaction.options.getString("year");
		let genres = interaction.options.getString("genres");
		let styles = interaction.options.getString("styles");
		let spotify = interaction.options.getString("spotify");

		// Validate that the styles and genres are valid.
		// If genre is not valid, skip that genre
		let validGenres:string[] = [];
		let nonValidGenres:string[] = [];
		if(genres){
			// Split genres by comma.
			const genreNames = genres.split(",");
			// Loop through the genres.
			for (const genreName of genreNames) {
				// But we also have to loop through the enum....
				Object.values(MusicGenres).forEach((genre) => {
					// Check if the genre does not match.
					if (genre != genreName) {
						nonValidGenres.push(genre);
						return;
					}
					// If it does match, add to validated genres.
					else {
						validGenres.push(genre);
					}
				})
			}
		}

		let validStyles:string[] = [];
		let nonValidStyles:string[] = [];
		if(styles){
			// Split genres by comma.
			const styleNames = styles.split(",");
			// Loop through the genres.
			for (const styleName of styleNames) {
				// But we also have to loop through the enum....
				Object.values(MusicStyles).forEach((style) => {
					// Check if the genre does not match.
					if (style != styleName) {
						nonValidStyles.push(style);
						return;
					}
					// If it does match, add to validated genres.
					else {
						validStyles.push(style);
					}
				})
			}
		}

		// Create a new song object and apply our options.
		const newSong: I_MusicList = {
			name: name,
			artist: artist,
			ytmusic: ytmusic,
			album: album ? album : undefined,
			year: year ? parseInt(year) : undefined,
			genre: validGenres ? validGenres : undefined,
			styles: validStyles ? validStyles : undefined,
			spotify: spotify ? spotify : undefined,
		};

		// Validate the song.
		const feedback = validateSongs(newSong);

		// Add the song to the database.
		let reply = "";
		const songs: I_MusicList[] = [];
		songs.push(newSong);
		try {
			await DAO_AddMusic(songs);
			reply = "Song added!";
			if (feedback) {
				reply += `\n${feedback}`;
			}
			if(nonValidGenres.length > 0){
				reply += `\nInvalid genres you tried to input: ${nonValidGenres.join(", ")}`;
			}
			if(nonValidStyles.length > 0){
				reply += `\nInvalid styles you tried to input: ${nonValidStyles.join(", ")}`;
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
		const text = `\nSpotify link is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.year) {
		const text = `\nYear is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.album || !song.album) {
		const text = `\nAlbum is missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.genre || song.genre.length > 0) {
		const text = `\nGenres are missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	if (!song.styles || song.styles.length > 0) {
		const text = `\nStyles are missing for song: "${song.name}"`;
		feedback += text;
		console.log(text);
	}

	return feedback;
}

module.exports = [
	bo_AddMusic
];