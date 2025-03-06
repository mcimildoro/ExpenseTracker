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
    // If no userId is provided, return an empty array
    if (!userId) return []


    const results = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amount: expenses.amount,
        category: expenses.category,
        isShared: expenses.isShared,
        paidById: expenses.paidBy,
        paidByName: users.name,
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.id, users.id))
      // Only fetch shared expenses OR personal expenses that belong to the current user
      .where(or(eq(expenses.isShared, true), eq(expenses.userId, userId.toString())))
      .orderBy(desc(expenses.createdAt))

    return results.map((expense) => ({
      id: Number(expense.id),
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      isShared: expense.isShared,
      paidBy: expense.paidByName || "Unknown",
      userId: expense.paidById,
      createdAt: expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch expenses:", error)
    return []
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

    const balance = youPaidShared - totalShared / 2

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
    const results = await db.execute(`
      SELECT EXTRACT(MONTH FROM created_at) AS month, SUM(amount) AS amount
      FROM expenses
      WHERE EXTRACT(YEAR FROM created_at) = ${year} AND "userId" = ${userId}
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month;
    `)

    return results.rows.map((row) => ({
      month: Number(row[0]) - 1,
      amount: Number(row[1]),
    }))
  } catch (error) {
    console.error("Failed to fetch monthly expenses:", error)
    return []
  }
}

export async function getCategoryExpenses(year: number, userId: string): Promise<CategoryExpense[]> {
  try {
    const results = await db.execute(`
      SELECT category, SUM(amount) AS amount
      FROM expenses
      WHERE EXTRACT(YEAR FROM created_at) = ${year} AND "userId" = ${userId}
      GROUP BY category
      ORDER BY amount DESC;
    `)

    return results.rows.map((row) => ({
      category: String(row[0]),
      amount: Number(row[1]),
    }))
  } catch (error) {
    console.error("Failed to fetch category expenses:", error)
    return []
  }
}

