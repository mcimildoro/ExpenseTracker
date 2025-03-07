"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMonthlyExpenses, getCategoryExpenses } from "@/lib/data"
import type { MonthlyExpense, CategoryExpense } from "@/lib/types"
import { useSession } from "next-auth/react"

export function ExpenseCharts() {
  const [monthlyData, setMonthlyData] = useState<MonthlyExpense[]>([])
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const { data: session } = useSession()

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        if (session?.user?.id) {
          const [monthlyExpenses, categoryExpenses] = await Promise.all([
            getMonthlyExpenses(Number.parseInt(year), session.user.id),
            getCategoryExpenses(Number.parseInt(year), session.user.id),
          ]);
  
          
          console.log("📊 Monthly Data from API:", monthlyExpenses);

            // 🔥 Asegurar que todos los meses del año están presentes
            const filledMonthlyExpenses = Array.from({ length: 12 }, (_, i) => {
              const found = monthlyExpenses.find((entry) => entry.month === i);
              return found || { month: i, amount: 0 }; // Si no hay datos, poner 0
            });

            console.log("✅ Processed Monthly Data:", filledMonthlyExpenses);
            setMonthlyData(filledMonthlyExpenses);
            setCategoryData(categoryExpenses);
            }
        } catch (error) {
          console.error("Failed to fetch chart data:", error);
        } finally {
          setLoading(false);
        }
      };
      
    fetchChartData();
  }, [year, session?.user?.id]);
  

  // Find the maximum value for scaling the charts
  const maxMonthlyValue = Math.max(...monthlyData.map((d) => d.amount), 1)
  const maxCategoryValue = Math.max(...categoryData.map((d) => d.amount), 1)

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString("default", { month: "short" })
  }

  const getCategoryColor = (category: string) => {
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
console.log("item:", monthlyData)
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle className="pb-2">Expense Analysis</CardTitle>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(5)].map((_, i) => {
                const yearValue = (new Date().getFullYear() - i).toString()
                return (
                  <SelectItem key={yearValue} value={yearValue}>
                    {yearValue}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <div className="h-[300px] mt-4">
              <div className="flex h-full items-end space-x-2">
                {monthlyData.map((item) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{
                        height: `${(item.amount / maxMonthlyValue) * 250}px`,
                        minHeight: item.amount > 0 ? "4px" : "0",
                      }}
                    ></div>
                    <div className="text-xs mt-2">{getMonthName(item.month)}</div>
                    <div className="text-xs font-medium">€{item.amount.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="category">
            <div className="space-y-4 mt-4">
              {categoryData.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-medium">€{item.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getCategoryColor(item.category)}`}
                      style={{ width: `${(item.amount / maxCategoryValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

