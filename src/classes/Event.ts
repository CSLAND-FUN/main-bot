import DiscordBot from "./Discord";

import type { ClientEvents } from "discord.js";

type DistubeEventsTyped =
  | "error"
  | "addList"
  | "addSong"
  | "playSong"
  | "finishSong"
  | "empty"
  | "finish"
  | "initQueue"
  | "noRelated"
  | "disconnect"
  | "deleteQueue"
  | "searchCancel"
  | "searchNoResult"
  | "searchDone"
  | "searchInvalidAnswer"
  | "searchResult";

type If<V extends boolean, ForTrue, ForFalse = null> = V extends true
  ? ForTrue
  : ForFalse;

export class Event<
  DiscordEvent extends boolean = true,
  DistubeEvents extends boolean = false
> {
  public name: string;
  public emitter?: string;

  constructor(
    name: If<
      DiscordEvent,
      keyof ClientEvents,
      If<DistubeEvents, DistubeEventsTyped, string>
    >,
    emitter?: string
  ) {
    this.name = name as unknown as string;
    this.emitter = emitter ?? undefined;
  }

  run(client: DiscordBot, ...params: any[]) {
    throw new Error(`Event#run is not implemented in "${this.name}" Event!`);
  }
}
