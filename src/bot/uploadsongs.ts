import { DAO_AddMusic } from "../database/dao/music";
import { I_MusicList, MusicGenres, MusicStyles } from "../utilities/interface";

export async function uploadSongs() {
	const songs: I_MusicList[] = [
		{
			"name": "Jerk",
			"artist": "Oliver Tree",
			"album": "Ugly Is Beautiful",
			"year": 2020,
			"ytmusic": "https://music.youtube.com/watch?v=CSmH6fSMeHY&si=BFi4gBedO6pIEqLw",
			"genre": [MusicGenres.Electronic, MusicGenres.HipHop, MusicGenres.Pop],
			"styles": [MusicStyles.HipHop, MusicStyles.Trap, MusicStyles.DancePop]
		}, {
			"name": "96 Quite Bitter Beings",
			"artist": "CKY",
			"year": 1999,
			"album": "Volume 1",
			"ytmusic": "https://music.youtube.com/watch?v=aVdR6JeEyT8&si=4476TEwK1Kzqam5_",
			"genre": [MusicGenres.Rock],
			styles: [MusicStyles.AlternativeRock, MusicStyles.Punk, MusicStyles.Metal]
		}, {
			"name": "Flesh Into Gear",
			"artist": "CKY",
			"year": 2002,
			"album": "Jackass The Movie",
			"ytmusic": "https://music.youtube.com/watch?v=GpzYqkzBvF8&si=HWFLYMybVRPtELDC",
			"genre": [MusicGenres.Rock],
			"styles": [MusicStyles.Rock, MusicStyles.HardRock]
		}, {
			"name": "Jodellavitanonhocapitouncazzo",
			"artist": "Caparezza",
			"year": 2003,
			"album": "Verità supposte",
			"genre": [MusicGenres.Electronic, MusicGenres.HipHop],
			styles: [MusicStyles.Pop, MusicStyles.HipHop, MusicStyles.Ragga],
			"spotify": "https://open.spotify.com/track/05kv07AcsAQ0HnLsdb4NUA",
			"ytmusic": "https://music.youtube.com/watch?v=Gkxy54639og&si=YN2slMO0oaEWyYFC",
		}, {
			"name": "We Used To Wait",
			"artist": "Arcade Fire",
			"album": "The Suburbs",
			"year": 2010,
			"genre": [MusicGenres.Rock],
			"styles": [MusicStyles.IndieRock],
			"spotify": "https://open.spotify.com/track/37EmPMVwdBaKs7UhJOkHUU",
			"ytmusic": "https://music.youtube.com/watch?v=wRFkxOM90UA&si=i5mJO6SY5A5i9onh",
		}, {
			"name": "Spitting Off the Edge of the World",
			"year": 2022,
			"album": "Cool It Down",
			"artist": "Yeah Yeah Yeahs",
			"ytmusic": "https://music.youtube.com/watch?v=15m_iQaKHVg&si=JD0jQYJOk5cl56aZ",
			"genre": [MusicGenres.IndieRock, MusicGenres.Rock],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock]
		}, {
			"name": "Now or Never Now",
			"album": "Art of Doubt",
			"year": 2018,
			"artist": "Metric",
			"ytmusic": "https://music.youtube.com/watch?v=bbkAKfmWjsE&si=wVVVZH5A1K4RbIKb",
			"genre": [MusicGenres.Rock, MusicGenres.Alternative],
			styles: [MusicStyles.AlternativeRock, MusicStyles.IndieRock]
		}, {
			"artist": "Ceasars",
			"year": 2002,
			"name": "Jerk It Out",
			"album": "Love For The Streets",
			"ytmusic": "https://music.youtube.com/watch?v=QPXQyks5d2Q&si=kA27FW-xz3tVgFRA",
			"genre": [MusicGenres.Rock],
			styles: [MusicStyles.IndiePop, MusicStyles.AlternativeRock]
		}, {
			"artist": "Discotronic",
			"year": 2022,
			"name": "Tricky Disco (Single Edit)",
			"album": "Hard Dance Mania 9",
			"ytmusic": "https://music.youtube.com/watch?v=zVxhuk-rVfs&si=WAITB1nebLU0BkKX",
			"genre": [MusicGenres.Electronic],
			styles: [MusicStyles.HardHouse, MusicStyles.HardTrance, MusicStyles.Eurodance]
		}, {
			"name": "Where's Your Head At",
			"artist": "Basement Jaxx",
			"ytmusic": "https://music.youtube.com/watch?v=omwXLXeTR4w&si=zKox8gmIYLt_fgOR",
			"spotify": "https://open.spotify.com/track/3cJh89D0za2SW705fNBo3b?si=d8045285e24c4d4e",
			"year": 2001,
			"album": "Rooty",
			"genre": [MusicGenres.Electronic, MusicGenres.Dance],
			styles: [MusicStyles.House, MusicStyles.Breaks]
		}, {
			"ytmusic": "https://music.youtube.com/watch?v=_HRyW5AngTo&si=g5g6IpHLmqPD7KbA",
			"artist": "Yeah Yeah Yeahs",
			"year": 2022,
			"album": "Cool It Down",
			"name": "Wolf",
			"rating": 0,
			"genre": [MusicGenres.IndieRock, MusicGenres.Rock],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock]
		}, {
			artist: "Modest Mouse",
			album: "Good News For People Who Love Bad News (20th Anniversary Expanded Edition)",
			year: 2024,
			name: "Float On (Dan the Automator Remix)",
			genre: [MusicGenres.Electronic, MusicGenres.Rock, MusicGenres.Pop],
			styles: [MusicStyles.IndieRock, MusicStyles.AlternativeRock],
			ytmusic: "https://music.youtube.com/watch?v=snNuQZ1UnQY&si=Szd6283eXmV2vW3Y"
		}, {
			ytmusic: "https://music.youtube.com/watch?v=crpRvkYzrtE&si=PuoviDSO-OaIooHn",
			name: "Can I Kick It?",
			artist: "A Tribe Called Quest",
			year: 1990,
			album: "People's Instinctive Travels and the Paths of Rhythm (25th Anniversary Edition)",
			genre: [MusicGenres.HipHop]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=1QpQqt7FLSE&si=3CoE0AFX_rmKUJe8",
			name: "High Enough",
			artist: "K.Flay",
			album: "Every Where Is Some Where (Deluxe Version)",
			year: 2017
		}, {
			ytmusic: "https://music.youtube.com/watch?v=E3yqv2PGugs&si=El3nH6YykyNw8bP6",
			name: "Corset Theme",
			artist: "TeddyLoid",
			year: 2010,
			album: "Panty & Stocking With Garterbelt The Original Soundtrack",
			genre: [MusicGenres.Electronic, MusicGenres.Pop, MusicGenres.StageScreen],
			styles: [MusicStyles.Jpop, MusicStyles.Electro, MusicStyles.SynthPop, MusicStyles.House, MusicStyles.Anison, MusicStyles.Soundtrack]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=ZCut2rFo1bk&si=yBTV4p5W7nvDcsQq",
			name: "Theme for Scanty & Knee Socks",
			artist: "TeddyLoid",
			year: 2010,
			album: "Panty & Stocking With Garterbelt The Original Soundtrack",
			genre: [MusicGenres.Electronic, MusicGenres.Pop, MusicGenres.StageScreen],
			styles: [MusicStyles.Jpop, MusicStyles.Electro, MusicStyles.SynthPop, MusicStyles.House, MusicStyles.Anison, MusicStyles.Soundtrack]
		}
	];
	// songs.push(song);
	const feedback = await DAO_AddMusic(songs);
	feedback.map((f) => {
		console.log(f);
	});
}