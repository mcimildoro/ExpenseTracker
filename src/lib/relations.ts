import { relations } from "drizzle-orm";
import { users, expenses } from "./schema";

export const expensesRelations = relations(expenses, ({ one }) => ({
  paidByUser: one(users, {
    fields: [expenses.paidBy], // Clave en `expenses`
    references: [users.name],  // Clave referenciada en `users`
  }),
}));
