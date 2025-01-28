import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Waifu } from "./core";

@Entity({ name: "user_waifu_interaction" })
export class UserWaifuInteraction {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ name: "user_id" })
	userId!: string; // e.g. Discord user ID

	@Column({ name: "waifu_id" })
	waifuId!: number;

	@ManyToOne(() => Waifu, { onDelete: "CASCADE" })
	@JoinColumn()
	waifu!: Waifu;

	// 'like' | 'dislike' | 'superlike'
	@Column()
	rating!: string;
}