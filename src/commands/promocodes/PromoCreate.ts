import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class PromoCreateCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.PROMOCODES,
      name: "promo-create",

      description: "Создаёт промокод на бонусы.",
      ownerOnly: true,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    var count = 0;
    var maxUses = 0;
    var amount = 0;

    const _count = args[0];
    if (!_count) {
      const embed = this.embed(
        "Red",
        bold("Укажите количество ваучеров!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    } else {
      const checker = Functions.checkNumber(Number(_count), true);
      if (typeof checker !== "number") {
        const embed = this.embed("Red", bold(checker), "❌");
        return message.reply({
          embeds: [embed],
        });
      }

      if (checker > 10) count = 10;
      else count = checker;
    }

    const _maxUsers = args[1];
    if (!_maxUsers) {
      const embed = this.embed(
        "Red",
        bold("Укажите количество активаций!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    } else {
      const checker = Functions.checkNumber(Number(_maxUsers), true);
      if (typeof checker !== "number") {
        const embed = this.embed("Red", bold(checker), "❌");
        return message.reply({
          embeds: [embed],
        });
      }

      maxUses = checker;
    }

    const _amount = args[2];
    if (!_amount) {
      const embed = this.embed(
        "Red",
        bold("Укажите сумму для промокода!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    } else {
      const checker = Functions.checkNumber(Number(_amount), true);
      if (typeof checker !== "number") {
        const embed = this.embed("Red", bold(checker), "❌");
        return message.reply({
          embeds: [embed],
        });
      }

      amount = checker;
    }

    const data = await client.bonuses.createPromocode(
      amount,
      maxUses,
      count > 1 ? true : false,
      count
    );

    const result = [];

    if (Array.isArray(data.data)) {
      result.push("Вот сгенерированные промокоды:");
      for (let i = 0; i < data.data.length; i++) {
        const promo = data.data[i];
        const word = Functions.declOfNum(promo.amount, [
          "бонус",
          "бонуса",
          "бонусов",
        ]);

        result.push(`${i + 1}. \`${promo.code}\` — ${promo.amount} ${word}`);
      }
    } else {
      const promo = data.data;
      const word = Functions.declOfNum(promo.amount, [
        "бонус",
        "бонуса",
        "бонусов",
      ]);

      result.push(
        "Вот сгенерированный промокод:",
        `— \`${promo.code}\` — ${promo.amount} ${word}`
      );
    }

    const embed = this.embed(
      "DarkPurple",
      result.map((str) => bold(str)).join("\n"),
      "💬"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
