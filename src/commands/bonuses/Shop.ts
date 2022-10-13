import { HistoryType } from "@modules/bonus-system";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Message,
} from "discord.js";

export = class ShopCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "shop",

      description: "Показывает доступные предметы из магазина системы Бонусов.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = client.bonuses.data(message.author.id);

    const bronzeCost = this.getCost(client, data.id, 1);
    const liteCost = this.getCost(client, data.id, 2);
    const megaCost = this.getCost(client, data.id, 3);

    const bronzeText = this.getInfo("bronze", bronzeCost.string);
    const liteText = this.getInfo("lite", liteCost.string);
    const megaText = this.getInfo("mega", megaCost.string);

    const [bronzeEmbed, liteEmbed, megaEmbed] = [
      this.embed(client, message, "DarkPurple", "user", bronzeText),
      this.embed(client, message, "DarkPurple", "user", liteText),
      this.embed(client, message, "DarkPurple", "user", megaText),
    ];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("buy-bronze")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("1️⃣")
        .setLabel("Купить Bronze")
        .setDisabled(data.roles.includes(1)),

      new ButtonBuilder()
        .setCustomId("buy-lite")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("2️⃣")
        .setLabel("Купить Lite")
        .setDisabled(data.roles.includes(2)),

      new ButtonBuilder()
        .setCustomId("buy-mega")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("3️⃣")
        .setLabel("Купить MEGA")
        .setDisabled(data.roles.includes(3))
    );

    const msg = await message.reply({
      embeds: [bronzeEmbed, liteEmbed, megaEmbed],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (b) => b.user.id === message.author.id,
    });

    collector.on("collect", async (btn) => {
      if (!btn.isButton()) return;

      switch (btn.customId) {
        case "buy-bronze": {
          if (data.bonuses < bronzeCost.cost) {
            const diff = bronzeCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              client,
              message,
              "Red",
              "user",
              bold(`❌ | Вам не хватает ${diff} ${word} для покупки Bronze!`)
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          data.bonuses -= bronzeCost.cost;
          data.roles.push(1);

          client.bonuses.update(data.id, data);
          client.bonuses.createHistoryItem(data.id, {
            type: HistoryType.BONUS,

            cost: bronzeCost.cost,
            date: Date.now(),
            message: "Покупка роли Bronze",
          });

          const embed = this.embed(
            client,
            message,
            "DarkPurple",
            "user",
            bold(`✅ | Вы купили Bronze за ${bronzeCost.string}!`)
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }

        case "buy-lite": {
          if (data.bonuses < liteCost.cost) {
            const diff = liteCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              client,
              message,
              "Red",
              "user",
              bold(`❌ | Вам не хватает ${diff} ${word} для покупки Lite!`)
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          data.bonuses -= liteCost.cost;
          data.roles.push(2);

          client.bonuses.update(data.id, data);
          client.bonuses.createHistoryItem(data.id, {
            type: HistoryType.BONUS,

            cost: liteCost.cost,
            date: Date.now(),
            message: "Покупка роли Lite",
          });

          const embed = this.embed(
            client,
            message,
            "DarkPurple",
            "user",
            bold(`✅ | Вы купили Lite за ${liteCost.string}!`)
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }

        case "buy-mega": {
          if (data.bonuses < megaCost.cost) {
            const diff = megaCost.cost - data.bonuses;
            const word = Functions.declOfNum(diff, [
              "бонус",
              "бонуса",
              "бонусов",
            ]);

            const embed = this.embed(
              client,
              message,
              "Red",
              "user",
              bold(`❌ | Вам не хватает ${diff} ${word} для покупки MEGA!`)
            );

            btn.update({
              embeds: [embed],
              components: [],
            });

            break;
          }

          data.bonuses -= megaCost.cost;
          data.roles.push(3);

          client.bonuses.update(data.id, data);
          client.bonuses.createHistoryItem(data.id, {
            type: HistoryType.BONUS,

            cost: megaCost.cost,
            date: Date.now(),
            message: "Покупка роли MEGA",
          });

          const embed = this.embed(
            client,
            message,
            "DarkPurple",
            "user",
            bold(`✅ | Вы купили MEGA за ${megaCost.string}!`)
          );

          btn.update({
            embeds: [embed],
            components: [],
          });

          break;
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (!collected.size && reason === "time") {
        await message.delete();
        await msg.delete();

        return;
      }
    });
  }

  getCost(
    client: DiscordBot,
    id: string,
    role_num: number
  ): { cost: number; string: string } {
    const data = client.bonuses.data(id);

    if (role_num === 1) {
      return {
        cost: 3000,
        string: "3000 бонусов",
      };
    } else if (role_num === 2) {
      if (data.roles.includes(1)) {
        return {
          cost: 5000,
          string: "5000 бонусов",
        };
      }

      return {
        cost: 8000,
        string: "8000 бонусов",
      };
    } else if (role_num === 3) {
      if (data.roles.includes(2)) {
        return {
          cost: 5000,
          string: "5000 бонусов",
        };
      } else if (data.roles.includes(1)) {
        return {
          cost: 10000,
          string: "10000 бонусов",
        };
      }

      return {
        cost: 13000,
        string: "13000 бонусов",
      };
    }
  }

  getInfo(role: "bronze" | "lite" | "mega", cost: string): string {
    var out: string[];

    switch (role) {
      case "bronze": {
        out = [
          "**При покупке Bronze вы получаете:**",
          "- **Уникальный значок рядом с ролью <:bronze_badge:940218435667890216>**",
          "- **Денежный ваучер с суммой 20 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }

      case "lite": {
        out = [
          "**При покупке Lite вы получаете:**",
          "- **Уникальный значок рядом с ролью <:lite_badge:940218368319975424>**",
          "- **Возможность создавать приватные лобби.**",
          "- **Денежный ваучер с суммой 30 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }

      case "mega": {
        out = [
          "**При покупке MEGA вы получаете:**",
          "- **Уникальный значок рядом с ролью <:mega_badge:940218408845332510>**",
          "- **Возможность загружать файлы и картинки в общие чаты.**",
          "- **Использовать эмодзи и стикеры с других серверов.**",
          "- **Возможность создавать и настраивать приватные лобби.**",
          "- **Денежный ваучер с суммой 50 рублей.**",
          "",
          `› **Цена**: **${cost}**`,
        ];

        break;
      }
    }

    return out.join("\n");
  }
};
