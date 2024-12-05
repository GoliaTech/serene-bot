import { DAO_AddMusic } from "./database/dao/music";
import { AppDataSource } from "./database/datasource";
import { GenreType, I_MusicList, nodeEnvEnum } from "./utilities/interface";
import { logError, nodeEnv } from "./utilities/utilities";

async function uploadSongs() {
	const song: I_MusicList = {
		name: "Where's Your Head At",
		artist: "Basement Jaxx",
		ytmusic: "https://music.youtube.com/watch?v=video_id",
		genre: [GenreType.Electronic, GenreType.Dance],
		spotify: "https://music.youtube.com/watch?v=omwXLXeTR4w&si=zKox8gmIYLt_fgOR",
		year: 2001,
		album: "Rooty",
		rating: 0
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