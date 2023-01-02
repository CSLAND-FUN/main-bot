import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
import { ClanInvite } from "@modules/clans";
import DiscordBot from "@src/classes/Discord";

export = class ClanJoinCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-join",

      description: "Позволяет вступить в клан сервера.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const blacklisted = await client.bonuses.isBlacklisted(message);
    if (blacklisted === true) {
      const embed = this.embed(
        "Red",
        bold("Вы находитесь в чёрном списке!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const isInClan = await client.clans.isInClan(message.author.id);
    if (isInClan) {
      const embed = this.embed("Red", bold("Вы уже состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const _clans = await client.clans.getClans();
    const id = args[0];
    if (!id) {
      const embed = this.embed("Red", bold("Укажите ID клана!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const clan = _clans.find((x) => x.id === id);
    if (!clan) {
      const embed = this.embed(
        "Red",
        bold("Не удалось найти клан с таким ID!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    if (clan.type === 0) {
      const invite = await client.clans
        .sql<ClanInvite>("clans_invites")
        .select()
        .where({
          userID: message.author.id,
        })
        .finally();

      if (invite.length) {
        const embed = this.embed(
          "Red",
          bold("Вы уже подали заявку на вступление в клан!"),
          "❌"
        );

        return message.reply({
          embeds: [embed],
        });
      }

      await client.clans
        .sql<ClanInvite>("clans_invites")
        .insert({
          clanID: clan.id,
          userID: message.author.id,
          date: new Date(),
        })
        .finally();

      const embed = this.embed(
        "DarkPurple",
        bold("Вы подали заявку на вступление в клан, ожидайте!"),
        "✅"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.clans.joinClan(clan.id, message.author.id);
    if (result.status !== true) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const embed = this.embed("DarkPurple", bold(result.message), "✅");
    message.reply({
      embeds: [embed],
    });

    const nickname = message.member.user.username;
    return await message.member.edit({
      nick: `[${clan.tag}] ${nickname}`,
    });
  }
};
