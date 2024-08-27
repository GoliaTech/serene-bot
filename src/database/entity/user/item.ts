import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserInventory } from "./inventory";

@Entity()
export class Item {
	@PrimaryGeneratedColumn("increment")
	id!: number;
	@Column({ type: "varchar", length: 128 })
	name!: string;
	@Column({ type: "text", nullable: true })
	description!: string;
	@Column({ type: "text", nullable: true })
	lore!: string;
	@Column({ type: "varchar", length: 50 })
	type!: string;
	@Column({ name: "max_stack", type: "int" })
	max_stack!: number;
	@Column({ name: "currency_type", type: "varchar", length: 50 })
	currency_type!: string;
	@Column({ type: "int" })
	value!: number;
	@OneToMany(() => UserInventory, (userInventory) => userInventory.item)
	@JoinColumn({ name: "item_id" })
	userInventories!: UserInventory[];
}