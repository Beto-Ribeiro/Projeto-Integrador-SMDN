    import StatsCard from "../components/StatsCard";
    import AlertCard from "../components/AlertCard";
    import Header from "../components/Header";
    import "./dashboard.css";

    
function Dashboard() {
  return (
    <main className="dashboard">
      <Header />

      <section className="cards">
        <StatsCard
          title="Alertas Ativos"
          value="4"
        />

        <StatsCard
          title="Notificações"
          value="97.640"
        />

        <StatsCard
          title="Ocorrências"
          value="12"
        />
      </section>
      <section className="alerts">
  <h2>Ocorrências Recentes</h2>

  <AlertCard
    title="Enchente"
    location="Pindamonhangaba"
    risk="Alto"
  />

  <AlertCard
    title="Deslizamento"
    location="Campos do Jordão"
    risk="Médio"
  />

  <AlertCard
    title="Incêndio"
    location="Taubaté"
    risk="Crítico"
  />
</section>
    </main>
  );
}

export default Dashboard;