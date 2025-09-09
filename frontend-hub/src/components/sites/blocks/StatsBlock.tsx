interface Stat {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBlockProps {
  stats: Stat[];
  backgroundColor?: string;
  columns?: 2 | 3 | 4;
}

export default function StatsBlock({
  stats,
  backgroundColor = 'bg-primary/5',
  columns = 4,
}: StatsBlockProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`${backgroundColor} rounded-xl p-12 my-8`}>
      <div className={`grid ${columnClasses[columns]} gap-8 text-center`}>
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-4xl font-bold text-primary mb-2">
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </div>
            <div className="text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}