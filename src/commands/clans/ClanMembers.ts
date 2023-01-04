import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  bold,
} from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import { ClanMember } from "@modules/clans";
import DiscordBot from "@src/classes/Discord";

const row = new ActionRowBuilder<ButtonBuilder>();

const previousButton = new ButtonBuilder();
previousButton.setStyle(ButtonStyle.Secondary);
previousButton.setCustomId("previous");
previousButton.setLabel("⬅️");

const nextButton = new ButtonBuilder();
nextButton.setStyle(ButtonStyle.Secondary);
nextButton.setCustomId("next");
nextButton.setLabel("➡️");

const deleteButton = new ButtonBuilder();
deleteButton.setStyle(ButtonStyle.Danger);
deleteButton.setCustomId("delete");
deleteButton.setLabel("🗑️");

row.addComponents(previousButton, nextButton, deleteButton);

export = class ClanMembersCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clan-members",

      description: "Даёт возможность узнать участников клана.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const blacklisted = await client.bonuses.isBlacklisted(message);
    if (blacklisted === true) {
      const embed = this.embed(
        "Red",
        bold("Вы находитесь в чёрном списке!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

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
      return message.reply({
        embeds: [embed],
      });
    }

    const members = await client.clans
      .sql<ClanMember>("clans_members")
      .select()
      .where({
        clanID: clan.id,
      })
      .finally();

    if (!members.length) {
      const embed = this.embed(
        "Red",
        bold("У клана отсутствуют участники!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setTitle(`${clan.name} | Участники клана`);
    embed.setTimestamp();

    let i = 0;
    let i1 = 10;
    let page = 1;

    await message.guild.members.fetch();
    const data = members
      .slice(i, i1)
      .map((_member, i) => {
        const member = message.guild.members.cache.get(_member.id);
        const date = _member.joinedAt
          .toLocaleString("ru", {
            timeZone: "Europe/Moscow",
          })
          .slice(0, 10);

        return [
          bold(`› Участник: ${member.toString()}`),
          bold(`› Дата вступления: ${date}`),
          "",
        ].join("\n");
      })
      .join("\n");

    embed.setDescription(data);
    embed.setFooter({
      text: `Страница ${page} из ${Math.ceil(members.length / 10)}`,
    });

    const msg = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,

      filter: (btn) => {
        return (
          ["previous", "next", "delete"].includes(btn.customId) &&
          btn.user.id === message.author.id
        );
      },
    });

    collector.on("collect", async (btn) => {
      switch (btn.customId) {
        case "previous": {
          i -= 10;
          i1 -= 10;
          page--;

          if (i < 0) {
            i = 0;
            i1 = 10;
            page = 1;
          }

          await message.guild.members.fetch();
          const data = members
            .slice(i, i1)
            .map((_member, i) => {
              const member = message.guild.members.cache.get(_member.id);
              const date = _member.joinedAt
                .toLocaleString("ru", {
                  timeZone: "Europe/Moscow",
                })
                .slice(0, 10);

              return [
                bold(`› Участник: ${member.toString()}`),
                bold(`› Дата вступления: ${date}`),
                "",
              ].join("\n");
            })
            .join("\n");

          embed.setDescription(data);
          embed.setFooter({
            text: `Страница ${page} из ${Math.ceil(members.length / 10)}`,
          });

          await btn.update({
            embeds: [embed],
            components: [row],
          });

          break;
        }

        case "next": {
          i += 10;
          i1 += 10;
          page++;

          if (i > members.length) {
            i = 0;
            i1 = 3;
            page = 1;
          }

          await message.guild.members.fetch();
          const data = members
            .slice(i, i1)
            .map((_member, i) => {
              const member = message.guild.members.cache.get(_member.id);
              const date = _member.joinedAt
                .toLocaleString("ru", {
                  timeZone: "Europe/Moscow",
                })
                .slice(0, 10);

              return [
                bold(`› Участник: ${member.toString()}`),
                bold(`› Дата вступления: ${date}`),
                "",
              ].join("\n");
            })
            .join("\n");

          embed.setDescription(data);
          embed.setFooter({
            text: `Страница ${page} из ${Math.ceil(members.length / 10)}`,
          });

          await btn.update({
            embeds: [embed],
            components: [row],
          });

          break;
        }

        case "delete": {
          await msg.delete();

          break;
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await msg.delete();
      }
    });
  }
};
