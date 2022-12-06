import type { ClientEvents } from "discord.js";
import DiscordBot from "./Discord";
import Logger from "./Logger";

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

type If<R extends boolean, ForTrue, ForFalse = null> = R extends true
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
    return Logger.error(
      `Event#run is not implemented in "${this.name}" Event!`,
      "Command"
    );
  }
}
