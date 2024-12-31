import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("name").notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("meals", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").notNullable();
    table.string("name").notNullable();
    table.string("description").defaultTo("");
    table.timestamp("datetime").notNullable();
    table.boolean("is_on_diet").notNullable();
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
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

  await knex.schema.createTable("verification_codes", function (table) {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").notNullable();
    table.string("code", 6).notNullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("used").defaultTo(false);
    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");

  await knex.schema.dropTable("meals");

  await knex.schema.dropTable("sessions");

  await knex.schema.dropTable("verification_codes");
}
