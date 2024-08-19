import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CardRarity } from "../../../utilities/interface";
import { CardCore } from "./core";
import { CardRewards } from "./rewards";

/**
 * Card Set
 *
 * @export
 * @class CardSet
 */
@Entity({ name: "card_set" })
export class CardSet {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: "varchar", length: 64, unique: true })
	name!: string;
	@Column({ type: "varchar", length: 200 })
	tagline!: string;
	@Column({ type: "text" })
	lore!: string;
	@Column({ type: "varchar", length: 16, default: CardRarity.common })
	rarity!: CardRarity;
	@Column({ type: "text", default: "None" })
	border_image!: string;
	@Column({ type: "text", default: "None" })
	cover_image!: string;
	@OneToMany(() => CardCore, (cardCore) => cardCore.set_id)
	cards!: CardCore[];
	@OneToMany(() => CardRewards, (cardRewards) => cardRewards.set)
	rewards!: CardRewards[];
}