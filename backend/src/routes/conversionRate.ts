import express from "express";
import knex from "../../db/knex";

const router = express.Router();

router.get("/", async (req, res) => {
  // Filtros da query string
  const { startDate, endDate, groupBy = "day", channel } = req.query;
  // Use apenas string para segurança no SQL
  const groupByValue = String(groupBy || "day");

  // Montagem do WHERE dinâmico
  let whereClauses = [];
  if (startDate && endDate) {
    whereClauses.push(`created_at BETWEEN '${startDate}' AND '${endDate}'`);
  }
  if (channel) {
    whereClauses.push(`origin = '${channel}'`);
  }
  const whereSQL =
    whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  // Query SQL completa, segura e sem ambiguidades
  const sql = `
    SELECT 
      DATE_TRUNC('${groupByValue}', created_at) AS period,
      origin AS channel,
      COUNT(*) AS total_sent,
      SUM(CASE WHEN response_status_id = 6 THEN 1 ELSE 0 END) AS converted
    FROM inside.users_surveys_responses_aux
    ${whereSQL}
    GROUP BY DATE_TRUNC('${groupByValue}', created_at), origin
    ORDER BY period
  `;

  try {
    const data = await knex.raw(sql);
    // No Knex+pg, o resultado fica em .rows
    const result = data.rows.map((item: any) => ({
      ...item,
      conversion_rate:
        Number(item.total_sent) === 0
          ? 0
          : Number(item.converted) / Number(item.total_sent),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal error", details: err });
  }
});

export default router;
