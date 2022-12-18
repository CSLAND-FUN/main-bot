import { ActivityType, Client, Collection } from "discord.js";
import Handler from "./Handler";

import { BonusSystem } from "@modules/bonuses";
import { LobbysSystem } from "@modules/lobbys";

import { DisTube, StreamType } from "distube";
import { SpotifyPlugin } from "@distube/spotify";
import { DeezerPlugin } from "@distube/deezer";
import { ClanSystem } from "@modules/clans";

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
        status: "dnd",
        activities: [
          {
            type: ActivityType.Competing,
            name: "csland.fun",
          },
        ],
      },
    });

    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();

    this.bonuses = new BonusSystem(this);
    this.clans = new ClanSystem(this);
    this.lobbys = new LobbysSystem(
      this,
      process.env.LOBBYS_CATEGORY_ID,
      process.env.LOBBYS_PARENT_ID
    );

    this.player = new DisTube(this, {
      emptyCooldown: 15000,
      joinNewVoiceChannel: false,
      plugins: [new SpotifyPlugin(), new DeezerPlugin()],

      searchSongs: 5,
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

    await this.login(process.env.BOT_TOKEN);
  }
};
