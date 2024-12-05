import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, ManyToOne, JoinColumn } from "typeorm";
import { Genre } from "./musicgenre";
import { Artist } from "./musicartist";
import { Style } from "./musicstyle";
import { Album } from "./musicalbum";

@Entity("music_list") // Table name in your database
export class Music {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	// @Column()
	// artist!: string;

	@Column()
	ytmusic!: string;

	@Column({ nullable: true })
	spotify?: string;

	@Column({ nullable: true })
	year?: number;

	// @Column({ nullable: true })
	// album?: string;

	@ManyToMany(() => Genre, (genre) => genre.songs, { cascade: true })
	@JoinTable({
		name: "music_genres", // Specify the join table name
		joinColumn: { name: "music_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "genre_id", referencedColumnName: "id" },
	})
	genres?: Genre[];

	@ManyToOne(() => Artist, (artist) => artist.songs, { cascade: true })
	@JoinColumn({ name: "artist_id" })
	artist!: Artist;

	@ManyToMany(() => Style, (style) => style.songs, { cascade: true })
	@JoinTable({
		name: "music_styles", // Specify the join table name
		joinColumn: { name: "music_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "style_id", referencedColumnName: "id" },
	})
	styles?: Style[];

	@ManyToOne(() => Album, (album) => album.songs, { cascade: true })
	@JoinColumn({ name: "album_id" })
	album?: Album;

	@Column({ default: 0 })
	rating!: number; // Default value of 0
}