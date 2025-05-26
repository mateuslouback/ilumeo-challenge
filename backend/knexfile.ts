// backend/knexfile.ts
import { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: "postgres",
      user: "postgres",
      password: "postgres",
      database: "ilumeo",
    },
  },
};

module.exports = config;
