"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSummary } from "@/lib/data"
import type { ExpenseSummaryData } from "@/lib/types"

export function ExpenseSummary() {
  const { data: session } = useSession()
  const [summary, setSummary] = useState<ExpenseSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        if (session?.user?.id) {
          // Change from user.name to user.id
          const data = await getSummary(session.user.id)       
          setSummary(data)
        }
      } catch (error) {
        console.error("Failed to fetch summary:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [session?.user?.id]) // Change dependency from user.name to user.id

  

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) return null
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Shared</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{summary.totalShared.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month: €{summary.sharedThisMonth.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{summary.yourPersonal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month: €{summary.yourPersonalThisMonth.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Partner Shared Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{summary.balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.balance > 0 ? "Partner owes you" : summary.balance < 0 ? "You owe partner" : "All settled up"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${summary.balance > 0 ? "text-green-500" : summary.balance < 0 ? "text-red-500" : ""}`}
          >
            €{Math.abs(summary.balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.balance > 0 ? "Partner owes you" : summary.balance < 0 ? "You owe partner" : "All settled up"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

