export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-awten-dark-50 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-awten-dark-50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-80 bg-awten-dark-50 rounded-lg animate-pulse" />
    </div>
  );
}


