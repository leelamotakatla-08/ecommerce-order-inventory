import { SearchX } from "lucide-react";

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">

      <SearchX size={42} />

      <h2>{title}</h2>

      <p>{message}</p>

    </div>
  );
}

export default EmptyState;