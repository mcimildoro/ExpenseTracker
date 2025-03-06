import { pgTable, integer, numeric, text, varchar, date, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const expenses = pgTable("expenses", {
	id: integer().primaryKey().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	notes: text(),
	owner: varchar({ length: 50 }),
	date: date().notNull(),
	categoryId: integer().notNull(),
	isPersonal: boolean(),
});
