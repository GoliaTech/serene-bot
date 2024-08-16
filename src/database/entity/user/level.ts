import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserCore } from "./core";

/**
 * User Level
 *
 * @export
 * @class UserLevel
 */
@Entity("user_level")
export class UserLevel {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@Column({ type: "int", default: 1 })
	level!: number;

	@Column({ type: "int", default: 0 })
	prestige!: number;

	@Column({ type: "int", default: 0 })
	xp!: number;

	@Column({ type: "int", default: 100 })
	xp_to_level!: number;

	@OneToOne(() => UserCore, (userCore) => userCore.user_level, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "uuid" }) // Explicitly join on the uuid column
	user!: UserCore;
};
