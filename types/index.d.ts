import { Collection } from "discord.js";

import { Command } from "@src/classes/Command";
import { Event } from "@src/classes/Event";

import { BonusSystem } from "@modules/bonuses";
import { LobbysSystem } from "@modules/lobbys";

import { DisTube } from "distube";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    aliases: Collection<string, string>;
    events: Collection<string, Event>;

    bonuses: BonusSystem;
    lobbys: LobbysSystem;

    player: DisTube;
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    BOT_TOKEN: string;
    OWNERS: string;

    LOBBYS_CATEGORY_ID: string;
    LOBBYS_CHANNEL_ID: string;

    WELCOME_CHANNEL_ID: string;
    STATUS_CHANNEL_ID: string;
    COMMANDS_CHANNEL_ID: string;
    NOTIFICATIONS_CHANNEL_ID: string;

    AUTOROLE_ID: string;
    SERVER_ID: string;

    API_BASE_URL: string;
    API_SECRET_TOKEN: string;

    MYSQL_HOST: string;
    MYSQL_USER: string;
    MYSQL_PASS: string;
    MYSQL_DATA: string;
  }
}
