import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Music } from "./music";

@Entity({ name: "music_album" })
export class Album {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@OneToMany(() => Music, (music) => music.album)
	songs!: Music[];
}