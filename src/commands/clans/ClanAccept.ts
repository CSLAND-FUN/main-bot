import { Command, CommandCategory } from "@src/classes/Command";
import { Message, bold } from "discord.js";
import { ClanInvite } from "@modules/clans";
import DiscordBot from "@src/classes/Discord";

export = class ClanAcceptCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-accept",

      description: "Принимает заявку на вступление в клан.",
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

    const clan = await client.clans.getUserClan(message.author.id);
    if (!clan) {
      const embed = this.embed("Red", bold("Клан не найден!"), "❌");
      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    if (clan.owner !== message.author.id) {
      const embed = this.embed(
        "Red",
        bold("Заявки на вступление может рассматривать только владелец клана!"),
        "❌"
      );

      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    const id = args[0];
    if (!id) {
      const embed = this.embed("Red", bold("Укажите номер заявки!"), "❌");
      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    const invites = await client.clans
      .sql<ClanInvite>("clans_invites")
      .select()
      .where({
        id: Number(id),
        clanID: clan.id,
      })
      .finally();

    if (!invites.length) {
      const embed = this.embed(
        "Red",
        bold("Заявка с таким номером не найдена!"),
        "❌"
      );

      return message.channel.send({
        content: message.author.toString(),
        embeds: [embed],
      });
    }

    await client.clans
      .sql<ClanInvite>("clans_invites")
      .delete()
      .where({
        id: Number(id),
        clanID: clan.id,
      })
      .finally();

    const result = await client.clans.joinClan(clan.id, invites[0].userID);
    if (result.status === true) {
      const embed = this.embed(
        "DarkPurple",
        bold("Заявка была успешно принята"),
        "✅"
      );

      message.reply({
        embeds: [embed],
      });

      const member = message.guild.members.cache.get(invites[0].userID);
      const nickname = member.user.username;
      await member.edit({
        nick: `[${clan.tag}] ${nickname}`,
      });

      return;
    }

    const embed = this.embed("Red", bold(result.message), "❌");
    return message.reply({
      embeds: [embed],
    });
  }
};
