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

export async function DAO_GetSongs(page: number = 1, limit: number = 10) {
	const musicManager = AppDataSource.manager;

	// Calculate pagination
	const skip = (page - 1) * limit;

	// Load songs with pagination
	const songs = await musicManager.find(Music, {
		relations: ["genres", "album", "artist", "styles"],
		skip,
		take: limit,
	});

	// Consolidated feedback output
	const feedback = songs.map((song, index) => {
		let songInfo = `#${index + 1 + skip}: ${song.name}\n`;
		if (song.album) songInfo += `  Album: ${song.album.name}\n`;
		if (song.artist) songInfo += `  Artist: ${song.artist.name}\n`;
		if (song.genres) songInfo += `  Genres: ${song.genres.map((g) => g.name).join(", ")}\n`;
		if (song.styles) songInfo += `  Styles: ${song.styles.map((s) => s.name).join(", ")}\n`;
		return songInfo;
	}).join("\n");

	console.log(feedback);

	// Return songs and feedback for use in the embed
	return { songs, feedback };
}

export async function DAO_GetSong(genre?: string) {
	const musicManager = AppDataSource.manager;

	let songs;
	if (genre) {
		songs = await musicManager.find(Music, {
			relations: ["genres", "album", "artist", "styles"],
			where: { genres: { name: genre } },
		});
	} else {
		songs = await musicManager.find(Music, {
			relations: ["genres", "album", "artist", "styles"],
		});
	}

	const randomSong = songs[Math.floor(Math.random() * songs.length)];

	return randomSong;
}