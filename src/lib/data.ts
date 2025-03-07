"use server"

import { db } from "./db"
import { expenses, users } from "./schema"
import { desc, eq, or } from "drizzle-orm"
import type { Expense, ExpenseSummaryData, MonthlyExpense, CategoryExpense, Users as UsersType } from "./types"

export async function getUsers(): Promise<UsersType[]> {
  try {
    const results = await db.select().from(users)
    return results
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return []
  }
}

export async function getExpenses(userId?: string): Promise<Expense[]> {
  try {
    if (!userId) return [];

    const results = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        category: expenses.category,
        isShared: expenses.isShared,
        paidById: expenses.paidBy, // 🔥 Obtenemos el ID del pagador
        paidByName: users.name, // 🔥 Obtenemos el nombre del pagador
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.paidBy, users.id)) // ✅ Relación corregida
      .where(or(eq(expenses.isShared, true), eq(expenses.userId, userId.toString())))
      .orderBy(desc(expenses.createdAt));

    const mappedExpenses = results.map((expense) => ({
      id: Number(expense.id),
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      isShared: expense.isShared,
      paidBy: expense.paidByName || "Unknown", // 🔥 Aquí debería aparecer el nombre
      userId: expense.paidById,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString(),
    }));

    console.log("🚀 Expenses after mapping:", mappedExpenses); // 🔥 Verifica si `paidBy` muestra nombres

    return mappedExpenses;
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}


export async function getSummary(userId: string): Promise<ExpenseSummaryData> {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)

    // Get all expenses (shared + user's personal)
    const allExpenses = await getExpenses(userId)

    const allUsers = await getUsers()
    const totalUsers = allUsers.length || 1;
    

    const filterByDate = (expense: Expense) => {
      if (!expense.createdAt) return false
      return new Date(expense.createdAt) >= firstDayOfMonth
    }

    // Calculate shared expenses
    const sharedExpenses = allExpenses.filter((expense) => expense.isShared)
    const totalShared = sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const sharedThisMonth = sharedExpenses.filter(filterByDate).reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate personal expenses (only for the current user)
    const personalExpenses = allExpenses.filter((expense) => !expense.isShared && expense.userId === userId)
    const yourPersonal = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const yourPersonalThisMonth = personalExpenses
      .filter(filterByDate)
      .reduce((sum, expense) => sum + expense.amount, 0)

    // Calculate shared expenses balance
    const youPaidShared = sharedExpenses
      .filter((expense) => expense.userId === userId)
      .reduce((sum, expense) => sum + expense.amount, 0)

    const balance = youPaidShared - totalShared / totalUsers;

    return {
      totalShared,
      sharedThisMonth,
      yourPersonal,
      yourPersonalThisMonth,
      partnerPersonal: 0, // We don't show partner's personal expenses
      partnerPersonalThisMonth: 0, // We don't show partner's personal expenses
      balance,
    }
  } catch (error) {
    console.error("Failed to calculate summary:", error)
    return {
      totalShared: 0,
      sharedThisMonth: 0,
      yourPersonal: 0,
      yourPersonalThisMonth: 0,
      partnerPersonal: 0,
      partnerPersonalThisMonth: 0,
      balance: 0,
    }
  }
}

export async function getMonthlyExpenses(year: number, userId: string): Promise<MonthlyExpense[]> {
  try {
    console.log("🔍 Debugging getMonthlyExpenses...");
    console.log("📆 Year:", year);
    console.log("👤 User ID:", userId);

    const query = `
      SELECT EXTRACT(MONTH FROM created_at) AS month, SUM(amount) AS amount
      FROM expenses
      WHERE EXTRACT(YEAR FROM created_at) = ${year} AND "user_id" = '${userId}'
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month;
    `;

    console.log("🛠 SQL Query:", query);

    const results = await db.execute(query);
    
    console.log("📊 Raw DB Results:", results.rows); // <-- Verifica lo que llega de la DB

    if (!results.rows || results.rows.length === 0) {
      console.warn("⚠️ No data returned from database");
    }

    // Si no hay datos, devolvemos un array vacío
    if (!results.rows || results.rows.length === 0) {
      return [];
    }

    // Mapeamos los resultados asegurando que month y amount sean valores numéricos correctos
    const mappedData = results.rows.map((row, index) => {
      const month = Number(row.month) - 1; // Convierte a número correctamente
      const amount = Number(row.amount); // Convierte el monto a número
      
      console.log(`📌 Mapped Row [${index}]:`, { month, amount });

      return { month, amount };
    });

    console.log("✅ Final Mapped Monthly Data:", mappedData);

    return mappedData;
  } catch (error) {
    console.error("❌ Failed to fetch monthly expenses:", error);
    return [];
  }
}



export async function getCategoryExpenses(year: number, userId: string): Promise<CategoryExpense[]> {
  try {
    console.log("🔍 Debugging getCategoryExpenses...");
    console.log("📆 Year:", year);
    console.log("👤 User ID:", userId);

    const query = `
      SELECT category, SUM(amount) AS amount
      FROM expenses
      WHERE EXTRACT(YEAR FROM created_at) = ${year} AND "user_id" = '${userId}'
      GROUP BY category
      ORDER BY amount DESC;
    `;

    console.log("🛠 SQL Query:", query);

    const results = await db.execute(query);

    const mappedResults = results.rows.map((row) => ({
      category: String(row.category), // ✅ Ahora obtiene el nombre de la categoría
      amount: Number(row.amount),
    }));

    console.log("✅ Final Mapped Category Data:", mappedResults);
    return mappedResults;
  } catch (error) {
    console.error("❌ Failed to fetch category expenses:", error);
    return [];
  }
}


