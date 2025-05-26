import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  Area,
} from "recharts";

// Cores customizadas por canal
const COLORS = [
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#eab308", // yellow
  "#f43f5e", // red
  "#06b6d4", // cyan
  "#8b5cf6", // purple
  "#f59e42", // orange
];

function formatChartData(raw) {
  const byChannel = {};
  raw.forEach((row) => {
    const date = row.period.split("T")[0];
    if (!byChannel[row.channel]) byChannel[row.channel] = [];
    byChannel[row.channel].push({
      date,
      ...row,
      conversion_rate: Number(row.conversion_rate),
      total_sent: Number(row.total_sent),
      converted: Number(row.converted),
    });
  });
  return byChannel;
}

// Resumo global
function getTotals(raw) {
  if (!raw.length) return { total: 0, converted: 0, rate: 0 };
  const total = raw.reduce((a, b) => a + Number(b.total_sent), 0);
  const converted = raw.reduce((a, b) => a + Number(b.converted), 0);
  return {
    total,
    converted,
    rate: total ? (converted / total) * 100 : 0,
  };
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const row = payload[0].payload;
    return (
      <div
        style={{
          background: "#18181b",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: 10,
          boxShadow: "0 2px 10px #0004",
          padding: 16,
          minWidth: 180,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Data: {label}</div>
        {payload.map((entry, idx) => {
          const ch = entry.name;
          return (
            <div key={idx} style={{ color: entry.color, marginBottom: 10 }}>
              <div>
                <b>Canal:</b> {ch}
              </div>
              <div>
                <b>Enviados:</b> {row[`${ch}_total_sent`] ?? "-"}
              </div>
              <div>
                <b>Convertidos:</b> {row[`${ch}_converted`] ?? "-"}
              </div>
              <div>
                <b>Taxa:</b> {((row[ch] || 0) * 100).toFixed(2)}%
              </div>
              <hr style={{ border: 0, borderTop: "1px solid #555" }} />
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

const periods = [
  { label: "Dia", value: "day" },
  { label: "Mês", value: "month" },
  { label: "Ano", value: "year" },
];

function App() {
  // States de filtros e dados
  const [rawData, setRawData] = useState([]);
  const [byChannel, setByChannel] = useState({});
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [loading, setLoading] = useState(false);

  // Atualiza dados conforme filtros
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:3001/conversion-rate", {
        params: {
          groupBy,
          ...(selectedChannel && { channel: selectedChannel }),
        },
      })
      .then((res) => {
        setRawData(res.data);
        const grouped = formatChartData(res.data);
        setByChannel(grouped);
        setChannels(Object.keys(grouped));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [groupBy, selectedChannel]);

  // Prepara datas do eixo x
  const allDates = Array.from(
    new Set(rawData.map((row) => row.period.split("T")[0]))
  ).sort();
  const chartData = allDates.map((date) => {
    const entry = { date };
    channels.forEach((ch) => {
      const found = byChannel[ch]?.find((d) => d.date === date);
      entry[ch] = found ? found.conversion_rate : 0;
      entry[`${ch}_total_sent`] = found ? found.total_sent : 0;
      entry[`${ch}_converted`] = found ? found.converted : 0;
    });
    return entry;
  });

  const totals = getTotals(rawData);

  // Estilo global (modo escuro opcional, só ativar background "#18181b")
  const cardStyle = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 18px #0001",
    padding: 24,
    margin: 8,
    textAlign: "center",
    flex: 1,
    color: "#18181b",
  };

  const dark = false; // Ative para modo escuro
  const baseBg = dark ? "#18181b" : "#f3f4f6";
  const baseColor = dark ? "#fff" : "#18181b";
  const cardBg = dark ? "#22223a" : "#fff";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: baseBg,
        color: baseColor,
        fontFamily: "Inter, Arial, sans-serif",
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "auto",
          padding: "36px 18px",
        }}
      >
        <h1 style={{ marginBottom: 10 }}>📊 Dashboard: Conversão por Canal</h1>
        <div style={{ color: "#888", marginBottom: 28 }}>
          Análise temporal da taxa de conversão e totais enviados/convertidos.
        </div>

        {/* Filtros */}
        {/* Filtros */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              htmlFor="canal-select"
              style={{ fontWeight: 600, marginRight: 6 }}
            >
              Canal:
            </label>
            <select
              id="canal-select"
              style={{ fontSize: 16, borderRadius: 6, padding: "6px 10px" }}
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="">Todos</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="periodo-select"
              style={{ fontWeight: 600, marginRight: 6 }}
            >
              Período:
            </label>
            <select
              id="periodo-select"
              style={{ fontSize: 16, borderRadius: 6, padding: "6px 10px" }}
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              marginLeft: "auto",
              color: "#666",
              fontSize: 16,
              alignSelf: "center",
            }}
          >
            {loading ? "Carregando..." : ""}
          </div>
        </div>

        {/* Cards de resumo */}
        <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
          <div style={{ ...cardStyle, background: cardBg }}>
            <div style={{ fontSize: 20, color: "#6366f1", fontWeight: 600 }}>
              Enviados
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {totals.total.toLocaleString()}
            </div>
          </div>
          <div style={{ ...cardStyle, background: cardBg }}>
            <div style={{ fontSize: 20, color: "#14b8a6", fontWeight: 600 }}>
              Convertidos
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {totals.converted.toLocaleString()}
            </div>
          </div>
          <div style={{ ...cardStyle, background: cardBg }}>
            <div style={{ fontSize: 20, color: "#eab308", fontWeight: 600 }}>
              Taxa de Conversão Média
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {totals.rate.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={440}>
          <LineChart data={chartData}>
            <CartesianGrid
              stroke="#e5e7eb"
              vertical={false}
              strokeDasharray="6 6"
            />
            <XAxis
              dataKey="date"
              fontSize={15}
              angle={-14}
              tick={{ dy: 7 }}
              style={{ fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              fontSize={15}
              tickFormatter={(v) => (v * 100).toFixed(1) + "%"}
              domain={[0, "auto"]}
              style={{ fontWeight: 600 }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={false}
            >
              <Label
                value="Taxa de Conversão (%)"
                angle={-90}
                position="insideLeft"
                fontSize={16}
                fontWeight={700}
                fill="#374151"
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 15, fontWeight: 600 }}
              iconType="circle"
              iconSize={16}
            />
            {channels.map((ch, idx) => (
              <React.Fragment key={ch}>
                {/* Área de preenchimento sutil para linha */}
                <Area
                  key={ch + "_area"}
                  type="monotone"
                  dataKey={ch}
                  fill={COLORS[idx % COLORS.length] + "30"}
                  stroke="none"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  key={ch}
                  type="basis"
                  dataKey={ch}
                  name={ch}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: COLORS[idx % COLORS.length],
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "#6366f1",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  isAnimationActive={false}
                />
              </React.Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Tabela Detalhada */}
        <h2 style={{ margin: "44px 0 20px" }}>Detalhamento Diário</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              background: cardBg,
              borderRadius: 14,
              boxShadow: "0 2px 10px #0001",
              fontSize: 15,
              minWidth: 500,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    background: "#f9fafb",
                    padding: 10,
                    fontWeight: 700,
                  }}
                >
                  Data
                </th>
                {channels.map((ch) => (
                  <th
                    key={ch}
                    style={{ background: "#f9fafb", fontWeight: 700 }}
                  >
                    {ch} - Enviados
                  </th>
                ))}
                {channels.map((ch) => (
                  <th
                    key={ch + "_conv"}
                    style={{ background: "#f9fafb", fontWeight: 700 }}
                  >
                    {ch} - Convertidos
                  </th>
                ))}
                {channels.map((ch) => (
                  <th
                    key={ch + "_rate"}
                    style={{ background: "#f9fafb", fontWeight: 700 }}
                  >
                    {ch} - Conversão (%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.date}>
                  <td style={{ padding: 8, fontWeight: 600 }}>{row.date}</td>
                  {channels.map((ch) => (
                    <td
                      key={ch + "_sent"}
                      style={{ textAlign: "right", padding: 8 }}
                    >
                      {row[`${ch}_total_sent`] || 0}
                    </td>
                  ))}
                  {channels.map((ch) => (
                    <td
                      key={ch + "_conv"}
                      style={{ textAlign: "right", padding: 8 }}
                    >
                      {row[`${ch}_converted`] || 0}
                    </td>
                  ))}
                  {channels.map((ch) => (
                    <td
                      key={ch + "_rate"}
                      style={{ textAlign: "right", padding: 8 }}
                    >
                      {(100 * (row[ch] || 0)).toFixed(2)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            color: "#9ca3af",
            marginTop: 30,
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Powered by Ilumeo • Desafio Tech Lead
        </div>
      </div>
    </div>
  );
}

export default App;
