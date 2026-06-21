export const STATUS_STYLES = {
  borrador: 'bg-gray-100 text-gray-600',
  programado: 'bg-blue-100 text-blue-700',
  publicado: 'bg-green-100 text-green-700',
};

export const STATUS_LABELS = {
  borrador: 'Borrador',
  programado: 'Programado',
  publicado: 'Publicado',
};

export function StatusBadge({ estado }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[estado] || STATUS_STYLES.borrador}`}>
      {STATUS_LABELS[estado] || estado}
    </span>
  );
}

export function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: category.color || '#6b7280' }}
    >
      {category.nombre}
    </span>
  );
}
