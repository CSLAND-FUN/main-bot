import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

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
    if (
      data.bonus_used !== null &&
      Number(data.bonus_used) < Number(data.bonus_used) + ms
    ) {
      const date = new Date(Number(data.bonus_used) + ms).toLocaleString("ru");
      const embed = this.embed(
        client,
        message,
        "Red",
        "user",
        bold(`Бонус можно получать раз в неделю!\nПопробуйте ещё раз ${date}`),
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
      client,
      message,
      "DarkPurple",
      "user",
      bold(`Вы получили еженедельный бонус в размере 500 бонусов!`),
      "🎉"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
