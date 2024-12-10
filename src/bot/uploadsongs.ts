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
		}, {
			name: "Thé à la menthe",
			ytmusic: "https://music.youtube.com/watch?v=83TomNHR6cQ&si=AsecKpbe0VF5oYr6",
			album: "Peines de Maures / Arc-en-ciel pour daltoniens",
			artist: "La Caution",
			year: 2005,
			genre: [MusicGenres.Electronic, MusicGenres.HipHop],
			styles: [MusicStyles.Electro, MusicStyles.HipHop]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=YucDMkNE-0M&si=shqrz5hHd50Wszdp",
			name: "Beat the Devil's Tattoo",
			artist: "Black Rebel Motorcycle Club",
			album: "Beat the Devil's Tattoo (Deluxe Edition)",
			year: 2010,
			genre: [MusicGenres.Rock],
			styles: [MusicStyles.GarageRock, MusicStyles.IndieRock]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=YucDMkNE-0M&si=shqrz5hHd50Wszdp",
			name: "Ain't No Rest For The Wicked",
			artist: "Cage The Elephant",
			album: "Cage The Elephant",
			year: 2008,
			genre: [MusicGenres.Rock],
			styles: [MusicStyles.IndieRock]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=lYJ0ukkVeOg&si=LbcsqpoSx0EEWKIG",
			name: "Right Here, Right Now",
			artist: "Fatboy Slim",
			album: "You've Come a Long Way Baby",
			year: 1998,
			styles: [MusicStyles.BigBeat],
			genre: [MusicGenres.Electronic]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=CyWIDJQGxCs&si=kyMu9aENpQ42sC5u",
			name: "Flower",
			artist: "Moby",
			album: "The B Sides",
			year: 1999,
			styles: [MusicStyles.Breakbeat, MusicStyles.Downtempo, MusicStyles.Ambient],
			genre: [MusicGenres.Electronic]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=W_K0hemcU5o&si=G2wjFNWH6M3MrYeF",
			artist: "M.I.A.",
			album: "Kala",
			year: 2007,
			name: "Paper Planes",
			genre: [MusicGenres.HipHop],
			styles: [MusicStyles.Pop, MusicStyles.Rap],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=rnO-MflYxCw&si=CkptLiH3sgVk73hs",
			artist: "Foster The People",
			name: "Pumped Up Kicks",
			album: "Torches",
			year: 2011,
			genre: [MusicGenres.Rock, MusicGenres.Electronic, MusicGenres.Pop],
			styles: [MusicStyles.IndieRock, MusicStyles.SynthPop],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=K1FlAphL2p8&si=d5rq2lImykVcnRXT",
			name: "Stressed Out",
			artist: "twenty one pilots",
			album: "Blurryface",
			year: 2015,
			genre: [MusicGenres.Electronic, MusicGenres.HipHop, MusicGenres.Rock],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=IuxWwWcnMac&si=YqKzonpswQ_1-SYu",
			name: "Lie",
			artist: "Alexander Condy",
			year: 2024,
			album: "For The Culture",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=ysho2xTWUYo&si=Rn1FxHUrGWRa9hkU",
			name: "Animal I Have Become",
			album: "One-X",
			artist: "Three Days Grace",
			year: 2006,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=OuK4OcMUGcg&si=CXcWM6tnpitnrKj_",
			name: "Ten Thousand Fists",
			artist: "Disturbed",
			album: "Ten Thousand Fists",
			year: 2005,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=bF5JEuAQgTM&si=YKK9G3xujY9upHks",
			name: "The Game",
			artist: "Disturbed",
			album: "The Sickness",
			year: 2000,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=tuw1ziytBDk&si=YqMyYkx3oHjkT8ee",
			artist: "TOOL",
			name: "Schism",
			album: "Lateralus",
			year: 2001,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=OMtq6JzREcA&si=yEK-hobMdOmLg-gX",
			artist: "System Of A Down",
			album: "Mezmerize",
			year: 2005,
			name: "B.Y.O.B.",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=BLZWkjBXfN8&si=6ajmyizHjFZFzN61",
			artist: "Linking Park",
			name: "In the End",
			album: "Hybrid Theory",
			year: 2000,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=BLZWkjBXfN8&si=6ajmyizHjFZFzN61",
			name: "Prayer Of The Refugee",
			artist: "Rise Against",
			album: "The Sufferer & The Witness",
			year: 2006,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=PjWNN4fQowQ&si=FSX1M7ceMgvsnrak",
			name: "Rap God",
			artist: "Eminem",
			year: 2013,
			album: "The Marshall Mathers LP2 (Deluxe)",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=Eaqyh97xOXs&si=wGtvXUHECiFrPPkI",
			name: "Survival",
			artist: "Eminem",
			year: 2013,
			album: "The Marshall Mathers LP2",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=D7oEoza3zOo&si=A3-201S5RyxveR8_",
			name: "My Name Is",
			artist: "Eminem",
			year: 1999,
			album: "The Slim Shady LP",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=tqxRidAWER8&si=TpStnf81aqyecKOy",
			artist: "Eminem",
			album: "The Eminem Show",
			name: "Without Me",
			year: 2002,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=7ifeDVAE_Zg&si=UiO43_bg_6kDgYH3",
			artist: "The Offspring",
			name: "Self Esteem (2008 Remaster)",
			album: "Smash (2008 Remaster)",
			year: 2008,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=8u2L1eSD874&si=WnblgjWtp4zpVBfC",
			artist: "Rumahoy",
			album: "Time II: Party",
			year: 2019,
			name: "Stolen Treasure",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=dqV2K116pnA&si=PHp3gDwRT1hHFsEm",
			artist: "Rumahoy",
			album: "Time II: Party",
			year: 2019,
			name: "Harambe The Pirate Gorilla",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=ODMJ58AEDeg&si=k3AKC3kS6Bh5weTT",
			artist: "Rumahoy",
			album: "Time II: Party",
			year: 2019,
			name: "The Beer from My Town is Better Than Yours",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=xF6TexX5uV8&si=BZq5TqQeniDR8BH6",
			artist: "Gloryhammer",
			year: 2019,
			name: "The Land of Unicorns",
			album: "Legends from Beyond the Galactic Terrorvortex",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=CQ6PoMG13Kw&si=hmcbdvV35KEQTk6c",
			artist: "Volturian",
			album: "Red Dragon",
			year: 2022,
			name: "Bury Me",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=kpnW68Q8ltc&si=3gqLrUUXn9CBXXd3",
			artist: "Mick Gordon",
			album: "DOOM Eternal",
			name: "The Only Thing They Fear is You",
			year: 2023,
			genre: [],
			styles: [MusicStyles.Soundtrack]
		}, {
			ytmusic: "https://music.youtube.com/watch?v=R9ESrQ_PvWc&si=krBG7ASDY0uXVvbb",
			artist: "Grits",
			album: "The Art of Translation",
			year: 2002,
			name: "Ooh Aah (My Life Be Like)",
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=FGRkt4naT-Y&si=IHqSY8QCCich7HFX",
			name: "The Ghost Inside",
			artist: "Broken Bells",
			album: "Broken Bells",
			year: 2010,
			genre: [],
			styles: [],
		}, {
			name: "Short Change Hero",
			ytmusic: "https://music.youtube.com/watch?v=GjTTB6yII4o&si=JycG7d1W8SViVrRd",
			artist: "The Heavy",
			album: "The House That Dirt Built",
			year: 2009,
			genre: [],
			styles: [],
		}, {
			ytmusic: "https://music.youtube.com/watch?v=v3cgdlHzQDQ&si=xgra5lqULUv4NkHe",
			artist: "Florence + the Machine",
			album: "The Machine",
			year: 2009,
			name: "Dog Days Are Over",
			genre: [],
			styles: [],
		}
	];
	// songs.push(song);
	const feedback = await DAO_AddMusic(songs);
	feedback.map((f) => {
		console.log(f);
	});
}