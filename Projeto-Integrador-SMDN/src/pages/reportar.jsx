import AlertCard from "../components/AlertCard";
import "./reportar.css";

const alertas = [
  {
    title: "Chuva Forte – Roseira",
    description: "Chuvas fortes entre Roseira e Moreira Cesar, cuidado ao dirigir. Evite sair de casa.",
    risk: "Regular",
    status: "Resolvido",
    dispatchedBy: "José Benedito dos Santos Alves",
    population: "Estimativa para 620",
    notifications: "412",
    date: "09/04/2026, às 22:12",
  },
  {
    title: "Tempestade Severa – Campos do Jordão",
    description: "Previsão de tempestade severa com ventos acima de 80 km/h para as próximas 6 horas.",
    risk: "Médio",
    status: "Ativo",
    dispatchedBy: "Carlos Henrique da Silva",
    population: "Estimativa para 18.000",
    notifications: "14.500",
    date: "06/04/2026, às 21:23",
  },
  {
    title: "Enchente grave – Rio Paraíba do Sul",
    description: "ATENÇÃO! Risco de enchente no Rio Paraíba do Sul, entre as cidades de Taubaté e Pindamonhangaba. Evacue as áreas ribeiras imediatamente.",
    risk: "Alto",
    status: "Ativo",
    dispatchedBy: "Carlos Henrique da Silva",
    population: "Estimativa para mais de 100.000",
    notifications: "73.502",
    date: "12/04/2026, às 12:33",
  },
];

function Reportar() {
  return (
    <main className="reportar">
      <header className="report-header">
        <div>
          <h1>Reportar</h1>
          <p>Gerencie e visualize os alertas emitidos</p>
        </div>
      </header>

      <section className="alerts">
        {alertas.map((alerta, i) => (
          <AlertCard key={i} {...alerta} />
        ))}
      </section>
    </main>
  );
}

export default Reportar;