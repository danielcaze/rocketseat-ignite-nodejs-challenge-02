import knex from "knex";
import knexConfig from "../../knexfile";

const config = knexConfig.development;
const db = knex(config);
export default db;
