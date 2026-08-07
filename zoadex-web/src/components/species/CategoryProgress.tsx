interface CategoryProgressProps {
  category: string;
  discovered: number;
  total: number;
}

export function CategoryProgress({ category, discovered, total }: CategoryProgressProps) {
  const percentage = total > 0 ? Math.round((discovered / total) * 100) : 0;

  return (
    <div className="category-progress">
      <div className="category-progress__header">
        <span className="category-progress__name">{category}</span>
        <span className="category-progress__count">
          {discovered}/{total}
        </span>
      </div>
      <div
        className="category-progress__bar"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category} progress: ${percentage}%`}
      >
        <div
          className="category-progress__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
