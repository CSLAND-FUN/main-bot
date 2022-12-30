import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  escapeMarkdown,
  Message,
} from "discord.js";
import { Queue, RepeatMode, Song } from "distube";
import { Event } from "@src/classes/Event";
import { v4 as uuid } from "uuid";
import DiscordBot from "@src/classes/Discord";

export = class PlaySongEvent extends Event<false, true> {
  constructor() {
    super("playSong", "player");
  }

  async run(client: DiscordBot, queue: Queue, song: Song) {
    const uploader = escapeMarkdown(song.uploader?.name ?? "Неизвестный");
    const name = escapeMarkdown(song?.name ?? "Неизвестно");

    const embed = new EmbedBuilder();
    embed.setAuthor({
      name: "CSLAND | Управление очередью",
      iconURL: client.user.avatarURL({ forceStatic: true, size: 2048 }),
    });
    embed.setTitle(`${uploader} - ${name}`);
    embed.setDescription(
      [
        `› **Запросил**: ${song.user.toString()}`,
        `› **Длина песни**: **${song.formattedDuration}**`,
      ].join("\n")
    );
    embed.setURL(song.url);
    embed.setThumbnail(song.thumbnail ?? null);
    embed.setTimestamp(new Date());

    const music_control_row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`resume-button_${uuid().slice(0, 5)}`)
          .setLabel("Продолжить")
          .setEmoji("▶"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`pause-button_${uuid().slice(0, 5)}`)
          .setLabel("Пауза")
          .setEmoji("⏸")
      );

    const queue_control_row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`stop-button_${uuid().slice(0, 5)}`)
          .setLabel("Остановить")
          .setEmoji("⏹"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`skip-button_${uuid().slice(0, 5)}`)
          .setLabel("Пропустить")
          .setEmoji("⏭")
      );

    const repeat_control_row =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`song-repeat-button_${uuid().slice(0, 5)}`)
          .setLabel("Повтор песни")
          .setEmoji("🔂"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`queue-repeat-button_${uuid().slice(0, 5)}`)
          .setLabel("Повтор очереди")
          .setEmoji("🔁"),

        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setCustomId(`disable-repeat-button_${uuid().slice(0, 5)}`)
          .setLabel("Отключить повтор")
          .setEmoji("❌")
      );

    const msg = await queue.textChannel.send({
      embeds: [embed],
      components: [music_control_row, queue_control_row, repeat_control_row],
    });

    await this.handleButtons(client, msg, song);
  }

  async handleButtons(client: DiscordBot, message: Message, song: Song) {
    const collector = await message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: song.duration * 1000,

      filter: (int) => {
        const ids = [
          "resume-button",
          "pause-button",
          "stop-button",
          "skip-button",
          "song-repeat-button",
          "queue-repeat-button",
          "disable-repeat-button",
        ];

        const regexp = new RegExp(ids.join("|"));
        return (
          song.user.id === int.user.id && regexp.exec(int.customId) !== null
        );
      },
    });

    collector.on("collect", (int) => {
      if (!int.isButton()) return;

      if (int.customId.includes("resume-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        } else if (queue.paused === false) {
          int.reply({
            content: "❌ | **Песня не стоит на паузе!**",
            ephemeral: true,
          });

          return;
        }

        queue.resume();
        int.reply({
          content: "✅ | **Проигрывание очереди было возобновлено!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("pause-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        } else if (queue.paused === true) {
          int.reply({
            content: "❌ | **Песня уже стоит на паузе!**",
            ephemeral: true,
          });

          return;
        }

        queue.pause();
        int.reply({
          content: "✅ | **Проигрывание очереди было остановлено!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("stop-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        }

        queue.stop();
        int.reply({
          content: "✅ | **Проигрывание очереди было окончено!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("skip-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        }

        queue.skip();
        int.reply({
          content: "✅ | **Текущая песня была пропущена!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("song-repeat-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        }

        queue.setRepeatMode(RepeatMode.SONG);
        int.reply({
          content: "✅ | **Был включён повтор песни!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("queue-repeat-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        }

        queue.setRepeatMode(RepeatMode.QUEUE);
        int.reply({
          content: "✅ | **Был включён повтор очереди!**",
          ephemeral: true,
        });

        return;
      } else if (int.customId.includes("disable-repeat-button")) {
        const queue = client.player.getQueue(int.guild.id);
        if (!queue) {
          int.reply({
            content: "❌ | **Очередь не найдена!**",
            ephemeral: true,
          });

          return;
        }

        queue.setRepeatMode(RepeatMode.DISABLED);
        int.reply({
          content: "✅ | **Повтор песни/очереди был выключен!**",
          ephemeral: true,
        });

        return;
      }
    });
  }
};
