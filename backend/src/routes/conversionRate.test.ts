import express from "express";
import request from "supertest";
import conversionRateRouter from "./conversionRate";

// Mock do Knex
jest.mock("../../db/knex", () => ({
  raw: jest.fn(),
}));
import knex from "../../db/knex";

// App express isolado para testar a rota
const app = express();
app.use(express.json());
app.use("/", conversionRateRouter);

describe("GET /", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna dados de conversão corretamente", async () => {
    // Simula retorno do banco (como .rows)
    (knex.raw as jest.Mock).mockResolvedValue({
      rows: [
        {
          period: "2025-05-23T00:00:00.000Z",
          channel: "email",
          total_sent: "100",
          converted: "25",
        },
        {
          period: "2025-05-23T00:00:00.000Z",
          channel: "wpp",
          total_sent: "200",
          converted: "10",
        },
      ],
    });

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        period: "2025-05-23T00:00:00.000Z",
        channel: "email",
        total_sent: "100",
        converted: "25",
        conversion_rate: 0.25,
      },
      {
        period: "2025-05-23T00:00:00.000Z",
        channel: "wpp",
        total_sent: "200",
        converted: "10",
        conversion_rate: 0.05,
      },
    ]);
    // Confirma que a query SQL contém "DATE_TRUNC"
    expect(knex.raw).toHaveBeenCalledWith(
      expect.stringContaining("DATE_TRUNC")
    );
  });

  it("retorna lista vazia se não houver dados", async () => {
    (knex.raw as jest.Mock).mockResolvedValue({ rows: [] });
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("retorna erro 500 se o banco falhar", async () => {
    (knex.raw as jest.Mock).mockRejectedValue(new Error("DB Error"));
    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal error");
    expect(res.body).toHaveProperty("details");
  });

  it("aplica filtros de data e canal no SQL", async () => {
    (knex.raw as jest.Mock).mockResolvedValue({ rows: [] });
    await request(app).get(
      "/?startDate=2024-01-01&endDate=2024-01-31&channel=email"
    );
    const sqlSent = (knex.raw as jest.Mock).mock.calls[0][0];
    expect(sqlSent).toMatch(/created_at BETWEEN '2024-01-01' AND '2024-01-31'/);
    expect(sqlSent).toMatch(/origin = 'email'/);
  });
});
