// src/App.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import App from "./App";
import axios from "axios";
import "@testing-library/jest-dom";

// Mock do axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockData = [
  {
    period: "2023-01-01T00:00:00.000Z",
    channel: "email",
    total_sent: 100,
    converted: 40,
    conversion_rate: 0.4,
  },
  {
    period: "2023-01-01T00:00:00.000Z",
    channel: "wpp",
    total_sent: 150,
    converted: 10,
    conversion_rate: 0.066,
  },
  {
    period: "2023-01-02T00:00:00.000Z",
    channel: "email",
    total_sent: 180,
    converted: 60,
    conversion_rate: 0.333,
  },
];

describe("App Dashboard", () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza cards de resumo com valores corretos", async () => {
    render(<App />);
    // Espera o texto "Enviados" aparecer nos cards
    await waitFor(() =>
      expect(screen.getAllByText(/Enviados/i).length).toBeGreaterThan(0)
    );

    // Os cards de resumo ficam no topo, então pegamos os primeiros matches
    const enviadosCard = screen.getAllByText(/Enviados/i)[0].parentElement;
    const convertidosCard =
      screen.getAllByText(/Convertidos/i)[0].parentElement;
    const taxaCard = screen.getAllByText(/Taxa de Conversão Média/i)[0]
      .parentElement;

    expect(enviadosCard).toHaveTextContent("430");
    expect(convertidosCard).toHaveTextContent("110");
    expect(taxaCard).toHaveTextContent("25.58");
  });

  it("renderiza gráfico e tabela detalhada", async () => {
    render(<App />);
    // Aguarda o gráfico ser renderizado
    await waitFor(() =>
      expect(screen.getByText(/Detalhamento Diário/i)).toBeInTheDocument()
    );
    // Checa datas da tabela
    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
    expect(screen.getByText("2023-01-02")).toBeInTheDocument();
    // Checa canais na tabela
    expect(screen.getAllByText(/email/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/wpp/i)[0]).toBeInTheDocument();
  });

  it("filtra por canal ao selecionar no filtro", async () => {
    render(<App />);
    // Aguarda carregamento inicial
    await waitFor(() => screen.getByLabelText(/Canal/i));
    // Seleciona canal "email"
    fireEvent.change(screen.getByLabelText(/Canal/i), {
      target: { value: "email" },
    });
    // Aguarda a chamada da API com o canal correto
    await waitFor(() =>
      expect(mockedAxios.get).toHaveBeenLastCalledWith(
        "http://localhost:3001/conversion-rate",
        expect.objectContaining({
          params: expect.objectContaining({ channel: "email" }),
        })
      )
    );
  });
});
