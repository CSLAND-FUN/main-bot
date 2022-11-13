import { query, QueryOptions, QueryResult } from "gamedig";
import { SERVERS, SERVER_NAMES } from "../config.json";
const statuses = ["⚫️ Неизвестно", "🟢 Онлайн", "🔴 Не работает"];

interface ReturnStatus {
  server: string;
  host: string;
  port: number;

  map: string;
  status: string;
  players: number;
}

export default async function getServers(): Promise<ReturnStatus[]> {
  const data: ReturnStatus[] = [];

  for (const server of SERVERS) {
    var server_data: QueryResult;

    try {
      server_data = await query(server as QueryOptions);
    } catch (error) {
      data.push({
        server: SERVER_NAMES[server.host],
        host: server.host,
        port: server.port,

        map: "-",
        players: 0,
        status: statuses[2],
      });

      continue;
    }

    data.push({
      server: SERVER_NAMES[server.host],
      host: server.host,
      port: server.port,

      map: server_data.map,
      players: server_data.players.length,
      status: statuses[1],
    });
  }

  return data;
}
