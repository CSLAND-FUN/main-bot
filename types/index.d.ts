import { Collection } from "discord.js";

import { Command } from "@src/classes/Command";
import { Event } from "@src/classes/Event";

import { BonusSystem } from "@modules/bonuses";
import { ClanSystem } from "@modules/clans";
import { LobbysSystem } from "@modules/lobbys";

import { DisTube } from "distube";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    aliases: Collection<string, string>;
    events: Collection<string, Event>;

    bonuses: BonusSystem;
    clans: ClanSystem;
    lobbys: LobbysSystem;

    player: DisTube;
  }
}
