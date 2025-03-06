import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}


export type Expense = {
  id: number
  description: string
  amount: number
  category: string
  isShared: boolean
  paidBy: string
  userId: string
  createdAt: string
}

export type UpdatedExpense = Omit<Expense, "createdAt"> & {
  createdAt?: string
}


  export type ExpenseSummaryData = {
    totalShared: number
    sharedThisMonth: number
    yourPersonal: number
    yourPersonalThisMonth: number
    partnerPersonal: number
    partnerPersonalThisMonth: number
    balance: number
  }
  
  export type MonthlyExpense = {
    month: number
    amount: number
  }
  
  export type CategoryExpense = {
    category: string
    amount: number
  }
  

  export type Users = {
    id: string;
    name: string;
    email: string;
    password?: string;
    createdAt: Date | null;
  };
  

  export  type ExpenseModalProps = {
    isOpen: boolean
    onClose: () => void
    onExpenseAdded: () => Promise<void>
  }