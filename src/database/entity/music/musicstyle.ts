import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Music } from "./music";

@Entity({ name: "music_style" })
export class Style {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	name!: string;

	@ManyToMany(() => Music, (music) => music.styles)
	songs!: Music[];
}