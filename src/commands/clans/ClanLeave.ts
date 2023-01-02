import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class ClanLeaveCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-leave",

      description: "Позволяет покинуть клан сервера.",
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
    if (isInClan === false) {
      const embed = this.embed("Red", bold("Вы не состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const clan = await client.clans.getUserClan(message.author.id);
    if (!clan) {
      const embed = this.embed("Red", bold("Клан не найден!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.clans.leaveClan(message.author.id);
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

    const nickname = message.member.nickname;
    if (nickname.includes(`[${clan.tag}] `)) {
      await message.member.edit({
        nick: nickname,
      });

      return;
    }
  }
};
