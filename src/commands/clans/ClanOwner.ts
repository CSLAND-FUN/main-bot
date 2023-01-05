import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class ClanOwnerCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-owner",

      description: "Передаёт права владением клана другому пользователю.",
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

    if (clan.owner !== message.author.id) {
      const embed = this.embed(
        "Red",
        bold("Только владелец клана может передавать свои права!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const member = message.mentions.members.first();
    if (!member) {
      const embed = this.embed(
        "Red",
        bold("Упомяните участника для передачи прав!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    if (member.user.bot) {
      const embed = this.embed(
        "Red",
        bold("Владельцем клана не может быть бот!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.clans.transferOwnership(member.id, clan.id);
    if (result.status !== true) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const embed = this.embed("DarkPurple", bold(result.message), "✅");
    return message.reply({
      embeds: [embed],
    });
  }
};
