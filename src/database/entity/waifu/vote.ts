import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
@Entity({ name: "waifu_votes" })
export class WaifuVote {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	user_id!: string; // Discord user ID

	@Column()
	waifu_id!: number;

	@Column()
	vote!: string; // 'like' or 'dislike'
}