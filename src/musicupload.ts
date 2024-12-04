import { DAO_AddMusic } from "./database/dao/music";
import { AppDataSource } from "./database/datasource";
import { GenreType, I_MusicList, nodeEnvEnum } from "./utilities/interface";
import { logError, nodeEnv } from "./utilities/utilities";

async function uploadSongs() {
	const song: I_MusicList = {
		name: "Song title",
		artist: "Artist name",
		ytmusic: "https://music.youtube.com/watch?v=video_id",
		genre: [GenreType.Electronic, GenreType.Indie],
		spotify: "https://open.spotify.com/track/track_id",
		year: 2022,
		album: "Album title",
		rating: 5
	};
	const songs: I_MusicList[] = [];
	songs.push(song);
	await DAO_AddMusic(songs);
}

(async () => {
	process.env.NODE_ENV = nodeEnv(nodeEnvEnum.development);
	AppDataSource.initialize();
	try {
		await uploadSongs();
		AppDataSource.destroy();
	} catch (e: any) {
		logError(e);
		AppDataSource.destroy();
		return;
	}
})();