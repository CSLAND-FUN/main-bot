import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import { BonusPromocode } from "@modules/bonuses";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class PromocodesCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.PROMOCODES,
      name: "promocodes",

      description: "Позволяет просмотреть все доступные графити.",
      ownerOnly: true,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const promocodes = await client.bonuses
      .sql<BonusPromocode>("bonus_promocodes")
      .select()
      .finally();

    if (!promocodes.length) {
      const embed = this.embed(
        "Red",
        bold(`На сервере пока что отсутствуют промокоды!`),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = [];

    for (const promo of promocodes) {
      const date = promo.date
        .toLocaleString("ru", { timeZone: "Europe/Moscow" })
        .slice(0, 10);

      const word = Functions.declOfNum(promo.amount, [
        "бонус",
        "бонуса",
        "бонусов",
      ]);

      result.push(`— ${promo.code} - ${promo.amount} ${word} | ${date}`);
    }

    const embed = this.embed(
      "DarkPurple",
      result.map((str) => bold(str)).join("\n")
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
