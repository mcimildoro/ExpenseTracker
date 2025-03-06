import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

async function main() {
  console.log("Running migrations...")

  const connectionString = process.env.DATABASE_URL || ""
  const sql = postgres(connectionString, { max: 1 })
  const db = drizzle(sql)

  await migrate(db, { migrationsFolder: "./drizzle" })

  console.log("Migrations completed!")
  await sql.end()
  process.exit(0)
}

main().catch((err) => {
  console.error("Error during migration:", err)
  process.exit(1)
})

