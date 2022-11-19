import DiscordBot from "@src/classes/Discord";
import {
  ChannelType,
  Collection,
  GuildMember,
  OverwriteData,
  Role,
  VoiceChannel,
  VoiceState,
} from "discord.js";
import { scheduleJob } from "node-schedule";

interface Lobby {
  id: string;
  owner: string;
  channel: VoiceChannel;

  options: LobbyOptions;
}

interface LobbyOptions {
  deleteIfOwnerLeaves: boolean;
}

export class LobbysSystem {
  public client: DiscordBot;
  public cache: Collection<string, Lobby>;

  public category_id: string;
  public parent_id: string;

  public channel_name = (tag: string) => `#${this.cache.size + 1} ${tag}`;

  constructor(client: DiscordBot, category: string, parent: string) {
    this.client = client;
    this.cache = new Collection();

    this.category_id = category;
    this.parent_id = parent;

    this.handle();

    scheduleJob("*/5 * * * *", async () => {
      console.log("[Lobbys] Cleaning up cache...");

      if (!this.cache.size) {
        return null;
      }

      for (const id of this.cache.keys()) {
        const channel = this.client.channels.cache.get(id);
        if (!channel) this.cache.delete(id);
      }
    });
  }

  public checkLobby(id: string) {
    const data = this.cache.get(id);
    if (!data) return false;

    return true;
  }

  public checkPermissions(id: string, user: string) {
    const data = this.cache.get(id);
    if (!data) return false;

    if (data.owner !== user) return false;
    else return true;
  }

  public editOptions(
    id: string,
    options: LobbyOptions
  ): { status: boolean; message?: string } {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    data.options = options;
    this.cache.set(id, data);

    return {
      status: true,
    };
  }

  public editMembers(
    id: string,
    count?: number
  ): { status: boolean; message?: string } {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    data.channel.setUserLimit(count ?? 0, "Владелец изменил лимит.");

    return {
      status: true,
    };
  }

  public grantAccess(id: string, grant_to: GuildMember | Role) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    data.channel.permissionOverwrites.create(grant_to, {
      Connect: true,
      Speak: true,
    });

    return true;
  }

  public revokeAccess(id: string, revoke_to: GuildMember | Role) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    data.channel.permissionOverwrites.create(revoke_to, {
      Connect: false,
      Speak: false,
    });

    return {
      status: true,
    };
  }

  public open(id: string) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags && role.tags.botId) continue;
      if (role.permissions.has("Administrator")) continue;

      data.channel.permissionOverwrites.create(role, {
        Connect: true,
        Speak: true,
      });
    }

    return {
      status: true,
    };
  }

  public close(id: string) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags && role.tags.botId) continue;
      if (role.permissions.has("Administrator")) continue;

      data.channel.permissionOverwrites.create(role, {
        Connect: false,
        Speak: false,
      });
    }

    return {
      status: true,
    };
  }

  public hide(id: string) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    const overwrites: OverwriteData[] = [];
    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags && role.tags?.botId) continue;
      if (role.permissions.has("Administrator")) continue;

      overwrites.push({
        id: role.id,
        deny: ["ViewChannel"],
      });
    }

    data.channel.permissionOverwrites.set(overwrites);

    return {
      status: true,
    };
  }

  public show(id: string) {
    const data = this.cache.get(id);
    if (!data) {
      return {
        status: false,
        message: "Не удалось найти лобби с таким ID!",
      };
    }

    const overwrites: OverwriteData[] = [];
    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags && role.tags.botId) continue;
      if (role.permissions.has("Administrator")) continue;

      overwrites.push({
        id: role.id,
        allow: ["ViewChannel"],
      });
    }

    data.channel.permissionOverwrites.set(overwrites);

    return {
      status: true,
    };
  }

  private handle() {
    if (!this.cache) this.cache = new Collection();

    console.log("[Lobbys] Creating Handler for Client#voiceStateUpdate Event");
    this.client.on("voiceStateUpdate", async (oldState, newState) => {
      var joined = !oldState.channel === null && newState.channel !== null;
      var left = oldState.channel !== null && newState.channel === null;
      var switched = oldState.channel !== null && newState.channel !== null;

      if (joined) {
        var category = newState.channel.parent.id === this.category_id;
        var parent = newState.channel.id === this.parent_id;

        if (category) {
          if (parent) {
            const cached = this.cache.find((x) => {
              return x.owner === newState.member.id;
            });
            if (cached) return;

            const channel = await this.createChannel(newState);
            this.cache.set(channel.id, {
              id: channel.id,
              owner: newState.member.id,
              channel: channel,

              options: {
                deleteIfOwnerLeaves: true,
              },
            });

            try {
              await newState.member.voice.setChannel(
                channel,
                "Пользователь создал Приватное Лобби."
              );
            } catch (error) {
              this.cache.delete(channel.id);
              await channel.delete();
            }
          }
        }
      } else if (left) {
        await this.check_and_delete(oldState, newState);
      } else if (switched) {
        var category = newState.channel.parent.id === this.category_id;
        var parent = newState.channel.id === this.parent_id;

        if (category) {
          if (parent) {
            const cached = this.cache.find((x) => {
              return x.owner === newState.member.id;
            });
            if (cached) return;

            const channel = await this.createChannel(newState);
            this.cache.set(channel.id, {
              id: channel.id,
              owner: newState.member.id,
              channel: channel,

              options: {
                deleteIfOwnerLeaves: true,
              },
            });

            try {
              await newState.member.voice.setChannel(
                channel,
                "Пользователь создал Приватное Лобби."
              );
            } catch (error) {
              this.cache.delete(channel.id);
              await channel.delete();
            }
          }
        }
      }
    });
  }

  async createChannel(state: VoiceState) {
    return state.guild.channels.create({
      name: this.channel_name(state.member.user.tag),
      type: ChannelType.GuildVoice,
      parent: this.category_id,
    });
  }

  private async check_and_delete(oldState: VoiceState, newState: VoiceState) {
    const _channel = this.cache.get(oldState.channel.id);
    if (!_channel) return;

    const channel = newState.guild.channels.cache.get(oldState.channel.id);
    if (!channel.isVoiceBased()) return;

    if (
      oldState.member.id === _channel.owner &&
      _channel.options.deleteIfOwnerLeaves === true
    ) {
      await channel.delete("Владелец вышел из канала");
      this.cache.delete(channel.id);

      return;
    }
  }
}
