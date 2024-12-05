import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Music } from "./music";

@Entity({ name: "music_genre" })
export class Genre {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@ManyToMany(() => Music, (music) => music.genres)
	songs!: Music[];
}