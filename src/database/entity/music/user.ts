import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Music } from "./index";

@Entity("user_song_interaction") // Table name in your database
export class UserSongInteraction {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({name: "user_id"})
	user_id!: string;

	@ManyToOne(() => Music, (music) => music.id, { onDelete: "CASCADE" })
	@JoinColumn({ name: "song_id" })
	song!: Music;

	@Column({name: "interaction_type"})
	interaction_type!: "like" | "dislike"; // Can only store 'like' or 'dislike'
}