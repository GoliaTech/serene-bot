import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserCore } from "./core";
import { Item } from "./item";

/**
 * User Inventory
 *
 * @export
 * @class UserInventory
 */
@Entity({ name: "user_inventory" })
export class UserInventory {
	@PrimaryColumn({ name: "user_uuid", type: "uuid" })
	user_uuid!: string;
	@PrimaryColumn({ name: "item_id", type: "int" })
	item_id!: number;
	@Column({ type: "int", default: 1 })
	amount!: number;
	@ManyToOne(() => Item, (item) => item.userInventories, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "item_id" })
	item!: Item;
	@ManyToOne(() => UserCore, (user) => user.inventory, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "user_uuid" })
	userCore!: UserCore;
}