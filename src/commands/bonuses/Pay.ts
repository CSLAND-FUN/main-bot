import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { bold, Message } from "discord.js";

export = class PayCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "pay",

      aliases: ["gift"],
      description: "Позволяет определённое кол-во бонусов.",
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const member = message.mentions.members.first();
    if (!member) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Укажите участника!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    if (member.id === message.author.id) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Вы не можете передать бонусы самому себе!")
      );

      return message.reply({
        embeds: [embed],
      });
    } else if (member.user.bot) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Вы не можете передать бонусы боту!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const amount = args[1];
    if (!amount || !Number(amount) || amount.includes("-")) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Укажите сумму (число)!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = client.bonuses.transfer(
      message.author.id,
      member.id,
      Number(amount)
    );

    if ("message" in result) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold(`❌ | ${result.message!}`)
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const word = Functions.declOfNum(amount as unknown as number, [
      "бонус",
      "бонуса",
      "бонусов",
    ]);

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold(`✅ | Вы передали ${member.toString()} ${amount} ${word}!`)
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
