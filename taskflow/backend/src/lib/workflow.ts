import { pool } from "../config/db"

export async function seedDefaultWorkflowStatuses(userId: number) {
  const defaults = [
    { slug: "todo", label: "Todo", color: "#64748b", category: "pending" },
    { slug: "in-progress", label: "In Progress", color: "#6366f1", category: "active" },
    { slug: "done", label: "Done", color: "#22c55e", category: "completed" }
  ]

  for (const [index, status] of defaults.entries()) {
    await pool.query(
      `
        INSERT INTO workflow_statuses (
          user_id,
          slug,
          label,
          color,
          category,
          system,
          position
        )
        VALUES ($1, $2, $3, $4, $5, true, $6)
        ON CONFLICT (user_id, slug) DO NOTHING
      `,
      [userId, status.slug, status.label, status.color, status.category, index]
    )
  }
}
