"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ExpenseModal } from "@/components/expense-modal"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseSummary } from "@/components/expense-summary"
import { ExpenseCharts } from "@/components/expense-charts"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, LogOut } from "lucide-react"
//import LoginPage from "@/app/login/page"

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [router, status])

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const refreshExpenses = async () => {
    setRefreshTrigger((prev) => !prev);
  };


  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <Button onClick={() => setIsModalOpen(true)} className="mr-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <p className="mb-4">Welcome, {session?.user?.name || "User"}!</p>

      <ExpenseSummary key={refreshTrigger.toString()} />

      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ExpenseList key={refreshTrigger.toString()} filter="all" onRefresh={refreshExpenses} />
        </TabsContent>
        <TabsContent value="shared">
          <ExpenseList key={refreshTrigger.toString()} filter="shared" onRefresh={refreshExpenses} />
        </TabsContent>
        <TabsContent value="personal">
          <ExpenseList key={refreshTrigger.toString()} filter="personal" onRefresh={refreshExpenses} />
        </TabsContent>
        <TabsContent value="charts">
          <ExpenseCharts />
        </TabsContent>
      </Tabs>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEditComplete={refreshExpenses}
        onExpenseAdded={refreshExpenses}
        expenseToEdit={null}
      />
    </div>
  )
}

