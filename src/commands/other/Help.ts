import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { bold, Message } from "discord.js";

export = class HelpCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "help",

      description: "Показывает список доступных команд.",
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      bold("Вот команды, которые доступны вам.")
    );

    const fields = this.getCommands(client, message);
    // @ts-ignore
    embed.addFields(fields);

    return message.reply({
      embeds: [embed],
    });
  }

  getCommands(client: DiscordBot, message: Message) {
    var BonusesField: { name?: string; value?: string; inline?: boolean } = {};
    var OtherField: { name?: string; value?: string; inline?: boolean } = {};
    var LobbysField: { name?: string; value?: string; inline?: boolean } = {};
    var ModerationField: { name?: string; value?: string; inline?: boolean } = {}; // prettier-ignore
    var MusicField: { name?: string; value?: string; inline?: boolean } = {};
    var OwnerField: { name?: string; value?: string; inline?: boolean } = {};

    BonusesField.name = "🪙 Система Бонусов";
    OtherField.name = "🫣 Другие команды";
    LobbysField.name = "🔊 Конфигурация лобби";
    ModerationField.name = "🛡️ Модерация";
    MusicField.name = "🎵 Музыка";
    OwnerField.name = "⚠️ Для разработчика";

    const BonusOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.BONUSES
    )) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      BonusOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }

    const OtherOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.OTHER
    )) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      OtherOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }

    const LobbysOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.LOBBY
    )) {
      const aliases = data.aliases
        ? ` (${data.aliases.map((a) => `\`!${a}\``).join(" | ")})`
        : "";

      LobbysOut.push(`\`!${data.name}\`${aliases} - ${bold(data.description)}`);
    }

    const ModerationOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.MODERATION
    )) {
      ModerationOut.push(`\`!${data.name}\` - ${bold(data.description)}`);
    }

    const MusicOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.MUSIC
    )) {
      MusicOut.push(`\`!${data.name}\` - ${bold(data.description)}`);
    }

    const OwnerOut = [];
    for (const [, { data }] of client.commands.filter(
      (c) => c.data.category === CommandCategory.OWNER
    )) {
      OwnerOut.push(`\`!${data.name}\` - ${bold(data.description)}`);
    }

    BonusesField.value = BonusOut.join("\n");
    OtherField.value = OtherOut.join("\n");
    LobbysField.value = LobbysOut.join("\n");
    ModerationField.value = ModerationOut.join("\n");
    MusicField.value = MusicOut.join("\n");
    OwnerField.value = OwnerOut.join("\n");

    if (message.author.id === "852921856800718908") {
      return [
        BonusesField,
        OtherField,
        LobbysField,
        MusicField,
        ModerationField,
        OwnerField,
      ];
    } else {
      return [
        BonusesField,
        OtherField,
        LobbysField,
        MusicField,
        ModerationField,
      ];
    }
  }
};
