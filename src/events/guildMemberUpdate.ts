import { Event } from "@src/classes/Event";

import { GuildMember } from "discord.js";
import { ClanMember } from "@modules/clans";
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
    if (!old_isInClan && !new_isInClan) {
      const clans = await client.clans.getClans();
      for (const clan of clans) {
        const is_member = await client.clans
          .sql<ClanMember>("clans_members")
          .select()
          .where({
            clanID: clan.id,
            id: newMember.id,
          })
          .finally();

        const tag = `[${clan.tag}] `;
        if (
          !oldMember.displayName.includes(tag) &&
          newMember.displayName.includes(tag) &&
          !is_member.length
        ) {
          const nickname = newMember.user.username.replace(tag, "");
          await newMember.edit({
            nick: nickname,
          });

          return;
        } else if (
          oldMember.displayName.includes(tag) &&
          newMember.displayName.includes(tag) &&
          !is_member.length
        ) {
          const nickname = newMember.user.username.replace(tag, "");
          await newMember.edit({
            nick: nickname,
          });

          return;
        }
      }
    }

    const clan = await client.clans.getUserClan(newMember.id);
    if (!clan) return;

    const oldNickname = oldMember.user.username;
    const newNickname = newMember.user.username;

    const clanTag = `[${clan.tag}] `;
    if (oldNickname.includes(clanTag) && !newNickname.includes(clanTag)) {
      await newMember.edit({
        nick: `[${clan.tag}] ${newMember.displayName}`,
      });

      return;
    }
  }
};
