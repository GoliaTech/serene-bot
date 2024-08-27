import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserCore } from "./core";
import { Item } from "./item";

/**
 * User Daily
 *
 * @export
 * @class UserDaily
 */
@Entity()
@Check(`"amount" > 0`)
@Check(`"amount" <= (SELECT "maxStack" FROM "item" WHERE "id" = "item_id")`)
export class UserInventory {
	@PrimaryColumn("uuid")
	uuid!: string;
	@PrimaryColumn({ name: "item_id", type: "int" })
	item_id!: number;
	@Column({ type: "int", default: 1 })
	amount!: number;
	@ManyToOne(() => Item, (item) => item.userInventories, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "id" })
	@JoinColumn({ name: "name" })
	item!: Item;
	@ManyToOne(() => UserCore, (user) => user.inventory, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "uuid" })
	userCore!: UserCore;
}