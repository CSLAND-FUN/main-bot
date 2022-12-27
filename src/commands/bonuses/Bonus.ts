import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message, time } from "discord.js";
import DiscordBot from "@src/classes/Discord";

const ms = 604800000;

export = class BonusCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "bonus",

      description: "Даёт еженедельный бонус.",
      cooldown: 10000,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses.data(message.author.id);
    const next_time = Number(data.bonus_used) + ms;

    if (data.bonus_used !== null && Date.now() < next_time) {
      const date = time(new Date(next_time));
      const date_r = time(new Date(next_time), "R");

      const embed = this.embed(
        "Red",
        bold(
          [
            `Бонус можно получать раз в неделю!`,
            `Попробуйте ещё раз ${date} (${date_r})`,
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
