import { HistoryType } from "@modules/bonus-system";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { bold, EmbedBuilder, Message, time } from "discord.js";

export = class HistoryCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "history",

      description: "Показывает историю покупок.",
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const data = client.bonuses.data(message.author.id);
    if (!data.history.length) {
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold("❌ | Ваша история покупок пустая!")
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setTitle("История покупок");
    embed.setAuthor({
      name: message.author.tag,
      iconURL: message.author.avatarURL(),
    });

    for (const entry of data.history) {
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
          `› **Время покупки**: ${time(Math.floor(1665658126264 / 1000), "R")}`,
        ].join("\n"),
      });
    }

    return message.reply({
      embeds: [embed],
    });
  }
};
