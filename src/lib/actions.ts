"use server"

import { revalidatePath } from "next/cache"
import { db } from "./db"
import { expenses, users } from "./schema"
import { eq  } from "drizzle-orm"



type ExpenseInput = {
  description: string
  amount: number
  category: string
  isShared: boolean
  paidBy: string
}




export async function addExpense(data: ExpenseInput) {
  try {
    console.log("🔥 Recibiendo datos para insertar en la DB:", data);

    if (!data.description || isNaN(data.amount) || !data.category || !data.paidBy) {
      console.error("❌ Error: Datos inválidos", data);
      return { success: false, error: "Faltan datos o son inválidos" };
    }

    // 🔥 Verificar si el usuario existe antes de insertar
    const userExists = await db.select().from(users).where(eq(users.id, data.paidBy)).limit(1);
    if (userExists.length === 0) {
      console.error(`❌ Error: No se encontró el usuario con ID: ${data.paidBy}`);
      return { success: false, error: "El usuario no existe" };
    }

    await db.insert(expenses).values({
      id: Math.floor(Math.random() * 1000000).toString(),
      description: data.description,
      amount: data.amount,
      category: data.category,
      isShared: data.isShared,
      paidBy: data.paidBy,
      userId: data.paidBy,
    });

    console.log("✅ Gasto añadido correctamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error en addExpense():", error);
    return { success: false, error: "No se pudo añadir el gasto" };
  }
}



export async function updateExpense(data: ExpenseInput & { id: number }) {
  try {
    console.log("🔥 Updating expense:", data)

    if (!data.description || isNaN(data.amount) || !data.category || !data.paidBy) {
      console.error("❌ Error: Invalid data", data)
      return { success: false, error: "Missing or invalid data" }
    }

    const [updatedExpense] = await db
      .update(expenses)
      .set({
        description: data.description,
        amount: data.amount,
        category: data.category,
        isShared: data.isShared,
        paidBy: data.paidBy,
      })
      .where(eq(expenses.id, data.id.toString()))
      .returning()

    if (!updatedExpense) {
      return { success: false, error: "Expense not found" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("❌ Error in updateExpense():", error)
    return { success: false, error: "Failed to update expense" }
  }
}

export async function deleteExpense(id: number) {
  try {
    await db.delete(expenses).where(eq(expenses.id, id.toString()))
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete expense:", error)
    throw new Error("Failed to delete expense")
  }
}
