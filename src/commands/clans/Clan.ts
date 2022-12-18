import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold, userMention } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class ClanCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan",

      description: "Получает информацию клана.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const isInClan = await client.clans.isInClan(message.author.id);
    if (isInClan === false) {
      const embed = this.embed("Red", bold("Вы не состоите в клане!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    var clans = await client.clans.getClans();
    const clan = await client.clans.getUserClan(message.author.id);
    if (!clan) {
      const embed = this.embed("Red", bold("Клан не найден!"), "❌");
      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    clans = clans.sort((a, b) => b.members - a.members);
    const index = clans.findIndex((c) => c.owner === clan.owner) + 1;
    const TYPES = {
      0: "Закрытый",
      1: "Открытый",
    };

    const data = [
      bold(`${clan.name} | [${clan.tag}]`),
      bold(`› Тип клана: ${TYPES[clan.type]}`),
      bold(`› Описание: ${clan.description}`),
      bold(`› Участников: ${clan.members}`),
      bold(`› Владелец: ${userMention(clan.owner)}`),
      bold(`› Место в топе: ${index}`),
      "\n",
    ].join("\n");

    const embed = this.embed("DarkPurple", data);
    return message.reply({
      embeds: [embed],
    });
  }
};
