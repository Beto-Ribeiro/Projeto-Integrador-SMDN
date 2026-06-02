function AlertCard({ title, description, risk, status, dispatchedBy, population, notifications, date }) {
  const riskColors = {
    "Alto": "#dc2626",
    "Médio": "#f97316",
    "Regular": "#22c55e",
    "Crítico": "#7c3aed",
  };

  const statusColors = {
    "Ativo": "#1e40af",
    "Resolvido": "#6b7280",
  };

  return (
    <div className="alert-card" style={{ borderLeft: `4px solid ${riskColors[risk] || "#ccc"}` }}>
      <div className="alert-badges">
        <span className="badge" style={{ background: riskColors[risk] || "#ccc" }}>{risk}</span>
        <span className="badge badge-status" style={{ background: statusColors[status] || "#ccc" }}>{status}</span>
      </div>

      <h3 className="alert-title">{title}</h3>
      <p className="alert-desc">{description}</p>

      <div className="alert-meta">
        <div><span>Disparado por:</span><strong>{dispatchedBy}</strong></div>
        <div><span>População afetada:</span><strong>{population}</strong></div>
        <div><span>Notificações</span><strong>{notifications}</strong></div>
        <div><span>Data</span><strong>{date}</strong></div>
      </div>
    </div>
  );
}

export default AlertCard;