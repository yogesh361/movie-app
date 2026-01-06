import { useWatchlist } from "@/context/watchlistContext";
import MovieCard from "@/common/MovieCard";
import EmptyWatchlist from "./EmptyWatchlist";
import { maxWidth, mainHeading } from "@/styles";

const Watchlist = () => {
  const { watchlist, clearWatchlist, watchlistCount } = useWatchlist();

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire watchlist?")) {
      clearWatchlist();
    }
  };

  if (watchlistCount === 0) {
    return <EmptyWatchlist />;
  }

  return (
    <section className={`${maxWidth} py-24`}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className={mainHeading}>
          My Watchlist ({watchlistCount})
        </h1>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-all duration-300"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {watchlist.map((item) => (
          <MovieCard key={item.id} movie={item} category={item.media_type} />
        ))}
      </div>
    </section>
  );
};

export default Watchlist;
