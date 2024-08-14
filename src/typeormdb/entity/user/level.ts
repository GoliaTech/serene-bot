import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Core } from "./core";

@Entity({ name: "user_level" })
export class Level {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@OneToOne(() => Core)
	@JoinColumn({ name: "uuid" })
	core!: Core;

	@Column({ type: "int", nullable: false, default: 1 })
	level!: number;

	@Column({ type: "int", nullable: false, default: 0 })
	xp!: number;

	@Column({ type: "int", nullable: false, default: 100 })
	xp_to_level!: number;

	@Column({ type: "int", nullable: false, default: 0 })
	prestige!: number;
}