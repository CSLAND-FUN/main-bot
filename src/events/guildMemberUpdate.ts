import { Event } from "@src/classes/Event";

import { GuildMember } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class GuildMemberUpdateEvent extends Event {
  constructor() {
    super("guildMemberUpdate");
  }

  async run(
    client: DiscordBot,
    oldMember: GuildMember,
    newMember: GuildMember
  ) {
    const old_isInClan = await client.clans.isInClan(oldMember.id);
    const new_isInClan = await client.clans.isInClan(newMember.id);
    if (!old_isInClan || !new_isInClan) return;

    const clan = await client.clans.getUserClan(newMember.id);

    const oldNickname = oldMember.displayName;
    const newNickname = newMember.displayName;

    const clanTag = `[${clan.tag}] `;
    if (oldNickname.includes(clanTag) && !newNickname.includes(clanTag)) {
      await newMember.edit({
        nick: `[${clan.tag}] ${newMember.displayName}`,
      });

      return;
    }
  }
};
