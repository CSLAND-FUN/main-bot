import { bold, EmbedBuilder, Message, time } from "discord.js";
import { HistoryType, UserHistoryItem } from "@modules/bonuses";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class HistoryCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "history",

      description: "Показывает историю покупок.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses
      .knex<UserHistoryItem>("bonus_users_history")
      .select()
      .where({ user_id: message.author.id })
      .finally();

    if (!data.length) {
      const embed = this.embed(
        "Red",
        bold("Ваша история покупок пустая!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setTitle("История покупок");

    for (const entry of data) {
      const type =
        entry.type === HistoryType.BONUS
          ? "Покупка за бонусы"
          : "Покупка привилегии";

      const word = Functions.declOfNum(entry.cost, [
        "бонус",
        "бонуса",
        "бонусов",
      ]);

      embed.addFields({
        name: `[#] ${bold(type)}`,
        value: [
          `› **Цена**: ${bold(`${entry.cost} ${word}`)}`,
          `› **Сообщение**: ${bold(entry.message)}`,
          `› **Время покупки**: ${time(
            Math.floor(Number(entry.time) / 1000),
            "R"
          )}`,
        ].join("\n"),
      });
    }

    return message.reply({
      embeds: [embed],
    });
  }
};
