import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import {
  ActionRowBuilder,
  bold,
  Message,
  SelectMenuBuilder,
  TextChannel,
} from "discord.js";
import { SearchResult, SearchResultVideo } from "distube";

export = class SearchResultEvent extends Event<false, true> {
  constructor() {
    super("searchResult", "player");
  }

  async run(
    client: DiscordBot,
    message: Message,
    results: SearchResult[],
    query: string
  ) {
    var cache: Record<string, SearchResult> = {};
    const _results = results.map((r: SearchResultVideo, i) => {
      cache = {
        ...cache,
        [r.id]: r,
      };

      return [r.id, `[${r.uploader.name}] ${r.name}`];
    });

    const row = new ActionRowBuilder<SelectMenuBuilder>();
    const builder = new SelectMenuBuilder();
    builder.setCustomId("results-select-menu");
    builder.setPlaceholder("Выберите один вариант из возможных.");
    builder.setMinValues(1);
    builder.setMaxValues(1);

    const opts = [];
    for (const [id, res] of _results) {
      opts.push({
        label: res,
        value: id,
      });
    }

    builder.setOptions(opts);
    row.addComponents(builder);

    const msg = await message.channel.send({
      content: bold(`⏰ | У вас есть 30 секунд на выбор песни.`),
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (!i.isSelectMenu()) return;

      await i.update({
        content: bold("⏰ | Ожидайте..."),
        components: [],
      });

      setTimeout(async () => {
        await message.delete();
        await msg.delete();
      }, 2000);

      const id = i.values[0];
      await client.player.play(message.member.voice.channel, cache[id], {
        member: message.member,
        message: message,
        textChannel: message.channel as TextChannel,
      });
    });

    collector.on("end", async (c, reason) => {
      if (reason === "time") {
        await msg.delete();
      }
    });
  }
};
