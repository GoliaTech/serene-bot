import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CardRarity, CardRewardType, CardValueType } from "../../../utilities/interface";

// I am not setting nullables, because by default it is FALSE.


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

/**
 * Card Core
 *
 * @export
 * @class CardCore
 */
@Entity({ name: "card_core" })
export class CardCore {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ type: "varchar", length: 64 })
	name!: string;
	@Column({ type: "varchar", length: 200 })
	tagline!: string;
	@Column({ type: "text" })
	lore!: string;
	@ManyToOne(() => CardSet, (cardSet) => cardSet.cards, { onDelete: "CASCADE" })
	@JoinColumn({ name: "set_id" })
	set_id!: CardSet;
	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	release_date!: Date;
	@Column({ type: "varchar", length: 16, default: CardRarity.common })
	rarity!: CardRarity;
	@Column({ type: "text", default: "None" })
	border_image!: string;
	@Column({ type: "text", default: "None" })
	image_path!: string;
	@Column({ type: "text", default: "None" })
	artist_name!: string;
	@Column({ type: "text", default: "None" })
	artist_link!: string;
	@Column({ type: "int", default: 0 })
	value!: number;
	@Column({ type: "varchar", length: 20, default: CardValueType.common })
	value_type!: CardValueType;
};
/**
 * Card Rewards
 *
 * @export
 * @class CardRewards
 */
@Entity({ name: "card_rewards" })

export class CardRewards {
	@PrimaryGeneratedColumn()
	reward_id!: number;
	@ManyToOne(() => CardSet, (cardSet) => cardSet.rewards, { onDelete: "CASCADE" })
	@JoinColumn({ name: "set_id" })
	set!: CardSet;
	@Column({ type: "varchar", length: 50, default: CardRewardType.common_currency })
	reward_type!: CardRewardType;
	@Column({ type: "int" })
	reward_value!: number;
};

// import { IsIn } from "class-validator";
// export class CreateCardReward {
//     @IsIn(["common currency", "premium currency", "xp", "avatar", "banner"])
//     reward_type: string;
//     reward_value: number;
// };
