import { I_MusicList } from "../../utilities/interface";
import { AppDataSource } from "../datasource";
import { Artist, Genre, Music, Style, Album } from "../entity/music";

export async function DAO_AddMusic(songs: I_MusicList[]) {
	const musicManager = AppDataSource.manager;

	// Array to store feedback.
	const feedback: string[] = [];

	for (const song of songs) {
		// Check if the song already exists
		const existingSong = await musicManager.findOne(Music, {
			where: {
				name: song.name,
				album: { name: song.album },
				artist: { name: song.artist },
			},
			relations: ["album", "artist"],
		});

		if (existingSong) {
			console.log(`The song "${song.name}" already exists in the album "${song.album}" by "${song.artist}".`);
			continue; // Skip duplicates
		}

		// Find or create genres
		let genreNames, genres;
		if (song.genre) {
			genreNames = song.genre.map((g) => g.toString());
			genres = await Promise.all(
				genreNames.map(async (name) => {
					let genre = await musicManager.findOne(Genre, { where: { name: name } });
					if (!genre) {
						genre = musicManager.create(Genre, { name: name });
						await musicManager.save(Genre, genre);
					}
					return genre;
				})
			);
		}

		// Find or create styles
		let styleNames, styles;
		if (song.styles) {
			styleNames = song.styles.map((g) => g.toString());
			styles = await Promise.all(
				styleNames.map(async (name) => {
					let style = await musicManager.findOne(Style, { where: { name: name } });
					if (!style) {
						style = musicManager.create(Style, { name: name });
						await musicManager.save(Style, style);
					}
					return style;
				})
			);
		}

		// Find or create artist
		let artist = await musicManager.findOne(Artist, { where: { name: song.artist } });
		if (!artist) {
			artist = musicManager.create(Artist, { name: song.artist });
			await musicManager.save(Artist, artist);
		}

		// Find or create album
		let album = await musicManager.findOne(Album, { where: { name: song.album } });
		if (!album) {
			album = musicManager.create(Album, { name: song.album });
			await musicManager.save(Album, album);
		}

		// Create new song
		const newSong = musicManager.create(Music, {
			name: song.name,
			ytmusic: song.ytmusic,
			spotify: song.spotify,
			year: song.year,
			rating: song.rating,
			album,
			artist,
			genres,
			styles
		});

		// Save new song.
		await musicManager.save(Music, newSong);

		// Add feedback
		feedback.push(`The song "${song.name}" in the album "${song.album}" by "${song.artist}" has been added.`);
	}
	return feedback;
}

export async function DAO_GetSongs() {
	const musicManager = AppDataSource.manager;

	// Load all songs with their genres
	const songs = await musicManager.find(Music, { relations: ["genres", "album", "artist", "styles"] });

	songs.forEach((song) => {
		console.log(`Song: ${song.name}`);
		if (song.album) {
			console.log(`Album: ${song.album.name}`);
		}
		if (song.artist) {
			console.log(`Artist: ${song.artist.name}`);
		}
		if (song.genres) {
			console.log(`Genres: ${song.genres.map((g) => g.name).join(", ")}`);
		}
		if (song.styles) {
			console.log(`Styles: ${song.styles.map((g) => g.name).join(", ")}`);
		}
		// console.log(`Genres: ${song.genres.map((g) => g.name).join(", ")}`);
	});
}