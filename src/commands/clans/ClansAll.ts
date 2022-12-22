import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  bold,
  userMention,
} from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
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

export = class ClansAllCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.CLANS,
      name: "clans-all",

      aliases: ["clans"],
      description: "Выводит список всех кланов сервера.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const _clans = await client.clans.getClans();
    if (!_clans.length) {
      const embed = this.embed(
        "Red",
        bold("На сервере пока что отсутствуют кланы!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const embed = new EmbedBuilder();
    embed.setColor("DarkPurple");
    embed.setTitle("CSLAND | Кланы сервера");
    embed.setTimestamp();

    let i = 0;
    let i1 = 3;
    let page = 1;

    const clans = _clans.sort((a, b) => b.members - a.members);
    const data = clans
      .slice(i, i1)
      .map((clan, i) => {
        const TYPES = {
          0: "Закрытый",
          1: "Открытый",
        };

        const index = clans.indexOf(clan) + 1;
        return [
          bold(`[#${index}] ${clan.name} | [${clan.tag}]`),
          bold(`› Тип клана: ${TYPES[clan.type]}`),
          bold(`› Описание: ${clan.description}`),
          bold(`› Участников: ${clan.members}`),
          bold(`› Владелец: ${userMention(clan.owner)}`),
          bold(`› Для вступления: \`!clan-join ${clan.id}\``),
          "",
        ].join("\n");
      })
      .join("\n");

    embed.setDescription(data);
    embed.setFooter({
      text: `Страница ${page} из ${Math.ceil(clans.length / 3)}`,
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
          i -= 3;
          i1 -= 3;
          page--;

          if (i < 0) {
            i = 0;
            i1 = 3;
            page = 1;
          }

          const data = clans
            .slice(i, i1)
            .map((clan, i) => {
              const TYPES = {
                0: "Закрытый",
                1: "Открытый",
              };

              const index = clans.indexOf(clan) + 1;
              return [
                bold(`[#${index}] ${clan.name} | [${clan.tag}]`),
                bold(`› Тип клана: ${TYPES[clan.type]}`),
                bold(`› Описание: ${clan.description}`),
                bold(`› Участников: ${clan.members}`),
                bold(`› Владелец: ${userMention(clan.owner)}`),
                bold(`› Для вступления: \`!clan-join ${clan.id}\``),
                "",
              ].join("\n");
            })
            .join("\n");

          embed.setDescription(data);
          embed.setFooter({
            text: `Страница ${page} из ${Math.ceil(clans.length / 3)}`,
          });

          await btn.update({
            embeds: [embed],
            components: [row],
          });

          break;
        }

        case "next": {
          i += 3;
          i1 += 3;
          page++;

          if (i > clans.length) {
            i = 0;
            i1 = 3;
            page = 1;
          }

          const data = clans
            .slice(i, i1)
            .map((clan, i) => {
              const TYPES = {
                0: "Закрытый",
                1: "Открытый",
              };

              const index = clans.indexOf(clan) + 1;
              return [
                bold(`[#${index}] ${clan.name} | [${clan.tag}]`),
                bold(`› Тип клана: ${TYPES[clan.type]}`),
                bold(`› Описание: ${clan.description}`),
                bold(`› Участников: ${clan.members}`),
                bold(`› Владелец: ${userMention(clan.owner)}`),
                bold(`› Для вступления: \`!clan-join ${clan.id}\``),
                "",
              ].join("\n");
            })
            .join("\n");

          embed.setDescription(data);
          embed.setFooter({
            text: `Страница ${page} из ${Math.ceil(clans.length / 3)}`,
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
