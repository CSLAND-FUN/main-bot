import { GuildMember } from "discord.js";
import { Event } from "@src/classes/Event";
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
    const _isInClan = await client.clans.isInClan(newMember.id);
    if (!_isInClan) {
      const clans = await client.clans.getClans();
      const regexp = /\[(.*?)\]/gm;
      const includes_tag = regexp.test(newMember.nickname);

      if (includes_tag) {
        const clan = clans.find((x) => {
          const tag = newMember.nickname
            .match(regexp)[0]
            .replaceAll("[", "")
            .replaceAll("]", "");

          return x.tag === tag;
        });

        if (!clan) {
          try {
            await newMember.edit({
              nick: newMember.user.username,
            });
          } catch (error) {
            client.logger.error(
              `Cannot remove Clan Tag from user ${newMember.user.tag}`,
              "evt:guildMemberUpdate"
            );
          }

          return;
        } else {
          for (const clan of clans) {
            const tag = `[${clan.tag}] `;
            const is_member = await client.clans.isInClan(
              newMember.id,
              clan.id
            );

            if (is_member && !newMember.displayName.includes(tag)) {
              try {
                await newMember.edit({
                  nick: tag + newMember.user.username,
                });
              } catch (error) {
                client.logger.error(
                  `Cannot add Clan Tag to user ${newMember.user.tag}`,
                  "evt:guildMemberUpdate"
                );
              }

              return;
            } else if (!is_member && newMember.displayName.includes(tag)) {
              try {
                await newMember.edit({
                  nick: newMember.user.username,
                });
              } catch (error) {
                client.logger.error(
                  `Cannot remove Clan Tag from user ${newMember.user.tag}`,
                  "evt:guildMemberUpdate"
                );
              }

              return;
            }
          }
        }
      }
    }

    const isInClan = await client.clans.isInClan(newMember.id);
    if (!isInClan) return;

    const clan = await client.clans.getUserClan(newMember.id);
    if (!clan) return;

    const clanTag = `[${clan.tag}] `;
    if (!newMember.displayName.includes(clanTag)) {
      try {
        await newMember.edit({
          nick: clanTag + newMember.user.username,
        });
      } catch (error) {
        client.logger.error(
          `Cannot add Clan Tag to user ${newMember.user.tag}`,
          "evt:guildMemberUpdate"
        );
      }

      return;
    }
  }
};
