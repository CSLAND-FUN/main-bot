import DiscordBot from "./Discord";

export class Event {
  public name: string;
  public emitter?: string;

  constructor(name: string, emitter?: string) {
    this.name = name;
    this.emitter = emitter ?? undefined;
  }

  run(client: DiscordBot, ...params: any[]) {
    throw new Error(`Event#run is not implemented in "${this.name}" Event!`);
  }
}
