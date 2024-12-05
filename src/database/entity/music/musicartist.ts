import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Music } from "./music";

@Entity({ name: "music_artist" })
export class Artist {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@OneToMany(() => Music, (music) => music.artist)
	songs!: Music[];
}