import MovieCardSkeleton from "@/components/MovieCardSkeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">Cargando películas...</h1>
        <p className="text-lg text-gray-400 mt-2">Un momento por favor.</p>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Películas Populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Mejor Valoradas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Actualmente en Cines</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-3xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Próximas Películas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}