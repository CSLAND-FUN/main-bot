import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

const ms = 604800000;

export = class BonusCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "bonus",

      description: "Даёт еженедельный бонус.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses.data(message.author.id);
    const next_time = Number(data.bonus_used) + ms;

    if (data.bonus_used !== null && Date.now() < next_time) {
      // prettier-ignore
      const date = new Date(next_time).toLocaleString("ru", { timeZone: "Europe/Moscow" });
      const embed = this.embed(
        "Red",
        bold(
          [
            `Бонус можно получать раз в неделю!`,
            `Попробуйте ещё раз ${date}`,
          ].join("\n")
        ),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    await client.bonuses.update(
      message.author.id,
      "bonus_used",
      Date.now().toString()
    );

    await client.bonuses.update(
      message.author.id,
      "bonuses",
      data.bonuses + 250
    );

    const embed = this.embed(
      "DarkPurple",
      bold(`Вы получили еженедельный бонус в размере 250 бонусов!`),
      "🎉"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
