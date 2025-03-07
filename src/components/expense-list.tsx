"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTrash } from "react-icons/fa"
import { useSession } from "next-auth/react"

import { Session } from "next-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getExpenses, getUsers } from "@/lib/data"
import type { Expense } from "@/lib/types"
import { ExpenseModal } from "./expense-modal"
import { deleteExpense } from "@/lib/actions"

type ExpenseListProps = {
  filter: "all" | "shared" | "personal"
  onRefresh: () => Promise<void> // ✅ Nueva prop para actualizar la lista
}

export function ExpenseList({ filter, onRefresh }: ExpenseListProps) {
  const { data: session } = useSession() as unknown as { data: Session & { user: { id: string } } }
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  // 🔥 Cargar los gastos cuando el componente se monta
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        if (session?.user?.id) {
          // Obtener gastos y usuarios al mismo tiempo
          const [expensesData, usersData] = await Promise.all([
            getExpenses(session.user.id),
            getUsers()
          ]);
  
         
  
          // Crear un mapa de userId -> userName
          const userMap = usersData.reduce((acc, user) => {
            acc[user.id] = user.name;  // Almacena el nombre con el ID del usuario
            return acc;
          }, {} as Record<string, string>);
  
          // Actualizar los gastos con los nombres correctos en `paidBy`
          const updatedExpenses = expensesData.map((expense) => ({
            ...expense,
            paidBy: userMap[expense.userId] || "Unknown", // 🔥 Usamos `expense.userId` en lugar de `expense.paidBy`
          }));
  
   
  
          setExpenses(updatedExpenses);
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchExpenses();
  }, [session?.user?.id]);
  
  

  const filteredExpenses = expenses
    .filter((expense) => {
      if (filter === "shared") return expense.isShared
      if (filter === "personal") {
        // Show personal expenses only if they belong to the current user
        return !expense.isShared && expense.userId === session?.user?.id
      }
      // In "all" tab, show shared expenses and user's personal expenses
      return expense.isShared || expense.userId === session?.user?.id
    })
    .filter((expense) => {
      if (categoryFilter === "all") return true
      return expense.category === categoryFilter
    })
    .filter((expense) => {
      if (monthFilter === "all") return true
      const expenseMonth = expense.createdAt ? new Date(expense.createdAt).getMonth().toString() : ""
      return expenseMonth === monthFilter
    })
  

  const handleEdit = (expense: Expense) => {
    // TODO: Implement edit functionality
    console.log("Edit expense:", expense)
    setEditingExpense(expense)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id)
        setExpenses(expenses.filter((expense) => expense.id !== id))
        onRefresh()
      } catch (error) {
        console.error("Failed to delete expense:", error)
      }
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "fixed":
        return "bg-blue-500"
      case "utilities":
        return "bg-green-500"
      case "food":
        return "bg-yellow-500"
      case "other":
        return "bg-purple-500"
      case "personal":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date"; // ✅ Manejar `null`
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date"; // ✅ Evita errores si la fecha no es válida
  
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }



  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle>Expenses</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="0">January</SelectItem>
                <SelectItem value="1">February</SelectItem>
                <SelectItem value="2">March</SelectItem>
                <SelectItem value="3">April</SelectItem>
                <SelectItem value="4">May</SelectItem>
                <SelectItem value="5">June</SelectItem>
                <SelectItem value="6">July</SelectItem>
                <SelectItem value="7">August</SelectItem>
                <SelectItem value="8">September</SelectItem>
                <SelectItem value="9">October</SelectItem>
                <SelectItem value="10">November</SelectItem>
                <SelectItem value="11">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No expenses found</div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex flex-col">
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(expense.createdAt)} • Paid by {expense.paidBy}
                  </div>
                  <div className="flex mt-1 space-x-2">
                    <Badge
                      className={`${getCategoryBadgeColor(expense.category)} hover:${getCategoryBadgeColor(expense.category)}`}
                    >
                      {expense.category}
                    </Badge>
                    {expense.isShared ? (
                      <Badge variant="outline">Shared</Badge>
                    ) : (
                      <Badge variant="outline">Personal</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(expense)}>
                    <FaEdit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(expense.id)}>
                    <FaTrash className="h-4 w-4" />
                  </Button>
                  <div className="text-lg font-bold ml-4">€{expense.amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {editingExpense && (
        <ExpenseModal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          expenseToEdit={editingExpense}
          onEditComplete={onRefresh}
          onExpenseAdded={onRefresh}
        />
      )}
    </Card>
  )
}

