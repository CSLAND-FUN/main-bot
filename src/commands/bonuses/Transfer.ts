import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class PayCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "transfer",

      description: "__ПОЛНОСТЬЮ__ передаёт ваши бонусы.",
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

    const member = message.mentions.members.first();
    if (!member) {
      const embed = this.embed("Red", bold("Укажите участника!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    if (member.id === message.author.id) {
      const embed = this.embed(
        "Red",
        bold("Вы не можете передать бонусы самому себе!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    } else if (member.user.bot) {
      const embed = this.embed(
        "Red",
        bold("Вы не можете передать бонусы боту!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.bonuses.transfer(message.author.id, member.id);
    if ("message" in result) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const embed = this.embed(
      "DarkPurple",
      bold(`Вы __ПОЛНОСТЬЮ__ передали ${member.toString()} свои бонусы!`),
      "✅"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
