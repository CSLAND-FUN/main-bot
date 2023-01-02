import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class PayCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "pay",

      aliases: ["gift"],
      description: "Позволяет определённое кол-во бонусов.",
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

    const amount = args[1];
    if (!amount) {
      const embed = this.embed("Red", bold("Укажите сумму!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    if (Number.isNaN(amount)) return;
    const check = Functions.checkNumber(Number(amount), true);
    if (typeof check !== "number") {
      const embed = this.embed("Red", bold(check), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.bonuses.transfer(
      message.author.id,
      member.id,
      amount as any as number
    );

    if ("message" in result) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const word = Functions.declOfNum(amount as any as number, [
      "бонус",
      "бонуса",
      "бонусов",
    ]);

    const embed = this.embed(
      "DarkPurple",
      bold(`Вы передали ${member.toString()} ${amount} ${word}!`),
      "✅"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
