import { ActivityType, Client, Collection } from "discord.js";
import { DisTube, StreamType } from "distube";
import config from "../config.json";
import Handler from "./Handler";

import { SpotifyPlugin } from "@distube/spotify";
import { BonusSystem } from "@modules/bonus-system";
import { LobbysSystem } from "@modules/lobbys";

export = class DiscordBot extends Client {
  constructor() {
    super({
      intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildVoiceStates",
        "MessageContent",
      ],

      rest: {
        offset: 0,
      },

      presence: {
        activities: [
          {
            type: ActivityType.Competing,
            name: "csland.fun",
            url: "https://csland.fun/",
          },
        ],
      },
    });

    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();

    this.bonuses = new BonusSystem(this);
    this.lobbys = new LobbysSystem(
      this,
      "936993360697233468",
      "936993675622371400"
    );

    this.player = new DisTube(this, {
      emptyCooldown: 15000,
      joinNewVoiceChannel: false,
      plugins: [new SpotifyPlugin()],

      leaveOnStop: true,
      leaveOnEmpty: true,
      leaveOnFinish: true,

      streamType: StreamType.OPUS,
      ytdlOptions: {
        highWaterMark: 1 << 25,
        quality: "highest",
        filter: "audioonly",
      },
    });
  }

  async start() {
    new Handler(this).loadAll();

    await this.login(config.TOKEN);
  }
};
