export default function Alert({ type = "error", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            float: "right",
            background: "none",
            border: "none",
            color: "inherit",
            padding: 0,
            marginLeft: "1rem",
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
