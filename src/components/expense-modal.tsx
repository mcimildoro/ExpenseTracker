"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { addExpense, updateExpense } from "@/lib/actions"
import { getUsers } from "@/lib/data"
import type { Expense, Users as UsersType } from "@/lib/types"

type ExpenseModalProps = {
  isOpen: boolean
  onClose: () => void
  onEditComplete: () => Promise<void>
  onExpenseAdded: () => Promise<void>
  expenseToEdit: Expense | null
}

export function ExpenseModal({ isOpen, onClose, onExpenseAdded, onEditComplete, expenseToEdit }: ExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<UsersType[]>([])
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    isShared: true,
    paidBy: "User",
  })

  // Populate form data when editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        description: expenseToEdit.description,
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category,
        isShared: expenseToEdit.isShared,
        paidBy: expenseToEdit.userId || "", // Default to empty string if userId is null
      })
    } else {
      // Reset form when adding new expense
      setFormData({
        description: "",
        amount: "",
        category: "",
        isShared: false,
        paidBy: "",
      })
    }
  }, [expenseToEdit])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers()
        setUsers(userList)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (isOpen) fetchUsers()
  }, [isOpen])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const amount = Number.parseFloat(formData.amount)

    if (!formData.description.trim() || !formData.category.trim() || isNaN(amount) || !formData.paidBy.trim()) {
      alert("⚠️ Please fill in all fields correctly.")
      setIsSubmitting(false)
      return
    }

    try {
      if (expenseToEdit) {
        // Update existing expense
        const result = await updateExpense({
          id: expenseToEdit.id,
          description: formData.description,
          amount,
          category: formData.category,
          isShared: formData.isShared,
          paidBy: formData.paidBy,
        })

        if (result.success) {
          await onEditComplete()
          onClose()
        } else {
          alert("⚠️ Failed to update expense.")
        }
      } else {
        // Add new expense
        const result = await addExpense({
          description: formData.description,
          amount,
          category: formData.category,
          isShared: formData.isShared,
          paidBy: formData.paidBy,
        })

        if (result.success) {
          await onExpenseAdded()
          onClose()
        } else {
          alert("⚠️ Failed to add expense.")
        }
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit():", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed (Rent, Internet)</SelectItem>
                <SelectItem value="utilities">Utilities (Gas, Electricity, Water)</SelectItem>
                <SelectItem value="food">Food (Dining, Delivery)</SelectItem>
                <SelectItem value="other">Other (Concerts, etc.)</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paidBy" className="text-right">
              Paid By
            </Label>
            <Select value={formData.paidBy} onValueChange={(value) => handleChange("paidBy", value)}>
              <SelectTrigger id="paidBy" className="col-span-3">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isShared" className="text-right">
              Shared Expense
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="isShared"
                checked={formData.isShared}
                onCheckedChange={(checked) => handleChange("isShared" , checked)}
              />
              <Label htmlFor="isShared">{formData.isShared ? "Shared between both" : "Personal expense"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : expenseToEdit ? "Update Expense" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

