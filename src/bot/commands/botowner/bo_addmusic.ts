import { DAO_AddMusic } from "../../../database/dao/music";
import { AppDataSource } from "../../../database/datasource";
import { I_Command, I_MusicList } from "../../../utilities/interface";
import { commandBuilder } from "../../misc/builders";

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
			.setRequired(false))
	,
	options: {
		botOwner: true
	},
	async execute(interaction) {
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

		const songs: I_MusicList[] = [];
		songs.push(newSong);
		try {
			await DAO_AddMusic(songs);
			interaction.reply({ content: "Song added!" });
			return;
		} catch (error) {
			interaction.reply({ content: "Error adding song." });
			console.error(error);
			return;
		}
	},
};

module.exports = [
	bo_AddMusic
];