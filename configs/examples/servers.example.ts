import { QueryOptions } from "gamedig";

export const SERVERS: QueryOptions[] = [
  {
    type: "csgo",
    host: "SERVER_IP",
    port: 27015, //? Порт сервера
    maxAttempts: 10,
  },
];

export const SERVER_NAMES = {
  SERVER_IP: "Краткое название сервера",
};
