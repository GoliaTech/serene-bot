import { Events, GuildMember } from "discord.js";

const memberJoin = {
	name: Events.GuildMemberAdd,
	execute(member: GuildMember) {
		console.log(`Member joined: ${member.user.tag}`);
	}
};
module.exports = [
	memberJoin
];