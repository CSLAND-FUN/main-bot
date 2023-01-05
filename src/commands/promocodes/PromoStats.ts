import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import { BonusPromocode } from "@modules/bonuses";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class PromoStatsCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.PROMOCODES,
      name: "promo-stats",

      description: "Создаёт промокод на бонусы.",
      aliases: ["promo"],

      ownerOnly: true,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const code = args[0];
    if (!code) {
      const embed = this.embed(
        "Red",
        bold(`Напишите код для просмотра статистики!`),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const promocodes = await client.bonuses
      .sql<BonusPromocode>("bonus_promocodes")
      .select()
      .where({ code: code })
      .finally();

    if (!promocodes.length) {
      const embed = this.embed("Red", bold(`Данный промокод не найден!`), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const promo = promocodes[0];
    const date = promo.date
      .toLocaleString("ru", { timeZone: "Europe/Moscow" })
      .slice(0, 10);

    const word = Functions.declOfNum(promo.amount, [
      "бонус",
      "бонуса",
      "бонусов",
    ]);

    const data = [
      `› Код: ${promo.code}`,
      `› Использований: ${promo.uses} из ${promo.maxUses}`,
      `› Сумма: ${promo.amount} ${word}`,
      `› Дата создания: ${date}`,
    ]
      .map((str) => bold(str))
      .join("\n");

    const embed = this.embed("DarkPurple", data);
    return message.reply({
      embeds: [embed],
    });
  }
};
