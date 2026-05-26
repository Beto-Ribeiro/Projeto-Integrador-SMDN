function AlertCard({
  title,
  location,
  risk,
}) {
  return (
    <div className="alert-card">
      <div className="alert-top">
        <h3>{title}</h3>

        <span className="risk">
          {risk}
        </span>
      </div>

      <p>{location}</p>
    </div>
  );
}

export default AlertCard;