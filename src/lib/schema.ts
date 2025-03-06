import { pgTable, text, boolean, timestamp, doublePrecision,  } from "drizzle-orm/pg-core";



export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  isShared: boolean("is_shared").notNull().default(true),
  paidBy: text("paid_by").notNull(), // Changed to text to match with session userId
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})




export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // 🔥 Ahora Drizzle también lo reconoce
  email: text("email").notNull().unique(),
  password: text("password").notNull(), //
  createdAt: timestamp("created_at").defaultNow(),
})
