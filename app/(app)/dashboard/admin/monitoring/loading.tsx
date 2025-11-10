export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-awten-dark-50 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-awten-dark-50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 bg-awten-dark-50 rounded-lg animate-pulse" />
        <div className="h-40 bg-awten-dark-50 rounded-lg animate-pulse" />
      </div>
      <div className="h-80 bg-awten-dark-50 rounded-lg animate-pulse" />
    </div>
  );
}


