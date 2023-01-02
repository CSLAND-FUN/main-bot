import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class WhitelistCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OWNER,
      name: "whitelist",

      description: "Возвращает пользователю систему Бонусов.",
      ownerOnly: true,
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member) {
      const embed = this.embed("Red", bold("Укажите участника!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    client.bonuses.whitelist(member.id);
    const embed = this.embed(
      "DarkPurple",
      bold(`Вы разблокировали пользователя ${member.toString()}!`),
      "✅"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
