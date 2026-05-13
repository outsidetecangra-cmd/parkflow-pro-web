export function FilterBar() {
  const filters = ["Hoje", "Ontem", "Semana", "Mes", "Periodo personalizado", "Unidade", "Patio", "Operador"];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter, index) => (
        <button
          key={filter}
          className={`rounded-full px-4 py-2 text-sm ${index === 0 ? "bg-sky-600 text-white" : "border border-[hsl(var(--border))] bg-white dark:bg-slate-900"}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
