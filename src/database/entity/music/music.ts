import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany } from "typeorm";
import { Genre } from "./genre";

@Entity("music_list") // Table name in your database
export class Music {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
	artist!: string;

	@Column()
	ytmusic!: string;

	@Column({ nullable: true })
	spotify?: string;

	@Column({ nullable: true })
	year?: number;

	@Column({ nullable: true })
	album?: string;

	@ManyToMany(() => Genre, (genre) => genre.songs, { cascade: true })
	@JoinTable({
		name: "music_genres", // Specify the join table name
		joinColumn: { name: "music_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "genre_id", referencedColumnName: "id" },
	})
	genres!: Genre[];

	@Column({ default: 0 })
	rating!: number; // Default value of 0
}