import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class BlacklistCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OWNER,
      name: "blacklist",

      description: "Блокирует пользователю систему Бонусов.",
      ownerOnly: true,
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    const reason = args.slice(1).join(" ") || "Нарушение правил.";

    if (!member) {
      const embed = this.embed("Red", bold("Укажите участника!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    client.bonuses.blacklist(member.id, reason);
    const embed = this.embed(
      "DarkPurple",
      bold(
        `Вы заблокировали пользователю ${member.toString()} доступ системе Бонусов!`
      ),
      "✅"
    );

    return message.reply({
      embeds: [embed],
    });
  }
};
