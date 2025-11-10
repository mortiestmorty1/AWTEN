export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 bg-awten-dark-50 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-awten-dark-50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-awten-dark-50 rounded-lg animate-pulse" />
        <div className="h-64 bg-awten-dark-50 rounded-lg animate-pulse" />
      </div>
      <div className="h-72 bg-awten-dark-50 rounded-lg animate-pulse" />
      <div className="h-80 bg-awten-dark-50 rounded-lg animate-pulse" />
    </div>
  );
}


