import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { CardRewardType } from "../../../utilities/interface";
import { CardSet } from "./set";

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