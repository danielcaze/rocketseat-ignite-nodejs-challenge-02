import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("sessions", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").notNullable();
    table.text("refresh_token").notNullable();
    table.text("user_agent").nullable();
    table.text("ip_address").nullable();
    table.datetime("expires_at").notNullable();
    table.boolean("revoked").defaultTo(false);
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("sessions");
}
