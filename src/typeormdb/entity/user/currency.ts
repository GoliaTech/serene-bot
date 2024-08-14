import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Core } from "./core";

@Entity({ name: "user_currency" })
export class Currency {
	@PrimaryGeneratedColumn("uuid")
	uuid!: string;

	@OneToOne(() => Core)
	@JoinColumn({ name: "uuid" })
	core!: Core;

	@Column({ type: "int", default: 0 })
	common!: number;

	@Column({ type: "int", default: 0 })
	premium!: number;
}