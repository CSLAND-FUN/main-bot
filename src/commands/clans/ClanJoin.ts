import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
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
    const isInClan = await client.clans.isInClan(message.author.id);
    if (isInClan) {
      const embed = this.embed("Red", bold("Вы уже состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const _clans = await client.clans.getClans();
    const owner = message.mentions.members.first();
    if (!owner) {
      const embed = this.embed(
        "Red",
        bold("Упомяните владельца клана для вступления!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const clan = _clans.find((x) => x.owner === owner.id);
    if (!clan) {
      const embed = this.embed(
        "Red",
        bold("Не удалось найти клан с таким владельцем!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    if (clan.type === 0) {
      const embed = this.embed(
        "Red",
        bold("Клан закрыт, в него вступить нельзя!"),
        "❌"
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

    const nickname = message.member.displayName;
    return await message.member.edit({
      nick: `[${clan.tag}] ${nickname}`,
    });
  }
};
