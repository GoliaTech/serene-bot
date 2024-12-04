import { I_MusicList } from "../../utilities/interface";
import { AppDataSource } from "../datasource";
import { Genre, Music } from "../entity/music";
import { GenreType } from "../../utilities/interface";

export async function DAO_AddMusic(songs: I_MusicList[]) {
	const musicManager = AppDataSource.manager;

	for (const song of songs) {
		// find or create genres
		// const genreNames = ["Electronic", "Indie"];
		const genreNames = song.genre.map((g) => g.toString());
		const genres = await Promise.all(
			genreNames.map(async (name) => {
				let genre = await musicManager.findOne(Genre, { where: { name: name } });
				if (!genre) {
					genre = musicManager.create(Genre, { name: name });
					await musicManager.save(Genre, genre);
				}
				return genre;
			})
		);

		// create a new song and associate it with genres
		// const newSong = musicManager.create(Music, {
		// 	name: "Song title",
		// 	artist: "Artist name",
		// 	ytmusic: "https://music.youtube.com/watch?v=video_id",
		// 	genres,
		// });

		const newSong = musicManager.create(Music, {
			name: song.name,
			artist: song.artist,
			ytmusic: song.ytmusic,
			genres,
		});
		await musicManager.save(Music, newSong);
	}
}

export async function DAO_GetSongs() {
	const musicManager = AppDataSource.manager;

	// Load all songs with their genres
	const songs = await musicManager.find(Music, { relations: ["genres"] });

	songs.forEach((song) => {
		console.log(`Song: ${song.name}`);
		console.log(`Genres: ${song.genres.map((g) => g.name).join(", ")}`);
	});
}