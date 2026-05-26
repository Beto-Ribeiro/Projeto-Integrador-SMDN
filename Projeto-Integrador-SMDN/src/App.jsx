import "./App.css";
import StatsCard from "./components/StatsCard";

function App() {
  return (
    <main className="dashboard">
      <h1>Dashboard</h1>

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
    </main>
  );
}

export default App;