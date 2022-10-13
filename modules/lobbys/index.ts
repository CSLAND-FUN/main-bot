import DiscordBot from "@src/classes/Discord";
import {
  ChannelType,
  Collection,
  GuildMember,
  Role,
  VoiceChannel,
} from "discord.js";

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

  public channel_name = (tag: string) => `[#${this.cache.size + 1}] ${tag}`;

  constructor(client: DiscordBot, category: string, parent: string) {
    this.client = client;
    this.cache = new Collection();

    this.category_id = category;
    this.parent_id = parent;

    this.handle();
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
      if (role.tags.botId) continue;

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
      if (role.tags.botId) continue;

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

    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags.botId) continue;

      data.channel.permissionOverwrites.create(role, {
        ViewChannel: false,
      });
    }

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

    for (const [, role] of data.channel.guild.roles.cache) {
      if (role.tags.botId) continue;

      data.channel.permissionOverwrites.create(role, {
        ViewChannel: true,
      });
    }

    return {
      status: true,
    };
  }

  private handle() {
    console.log(
      "[Lobby System] Creating Handler for Client#voiceStateUpdate Event...\n"
    );

    this.client.on("voiceStateUpdate", async (oldState, newState) => {
      if (!oldState.channel && newState.channel) {
        if (newState.channel.parent.id === this.category_id) {
          if (newState.channel.id === this.parent_id) {
            const channel = await newState.guild.channels.create({
              name: this.channel_name(newState.member.user.tag),
              type: ChannelType.GuildVoice,
              parent: this.category_id,
            });

            this.cache.set(channel.id, {
              id: channel.id,
              owner: newState.member.id,
              channel: channel,

              options: {
                deleteIfOwnerLeaves: true,
              },
            });

            newState.member.voice.setChannel(
              channel,
              "Пользователь создал Приватное Лобби."
            );
          }
        }
      } else if (oldState.channel && !newState.channel) {
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
      } else if (oldState.channel && newState.channel) {
        if (newState.channel.parent.id === this.category_id) {
          if (newState.channel.id === this.parent_id) {
            const channel = await newState.guild.channels.create({
              name: this.channel_name(newState.member.user.tag),
              type: ChannelType.GuildVoice,
              parent: this.category_id,
            });

            this.cache.set(channel.id, {
              id: channel.id,
              owner: newState.member.id,
              channel: channel,

              options: {
                deleteIfOwnerLeaves: true,
              },
            });

            newState.member.voice.setChannel(
              channel,
              "Пользователь создал Приватное Лобби."
            );
          }
        }
      }
    });
  }
}
