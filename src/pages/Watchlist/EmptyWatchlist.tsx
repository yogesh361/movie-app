import { Link } from "react-router-dom";
import { FaRegBookmark } from "react-icons/fa";

const EmptyWatchlist = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <FaRegBookmark className="text-6xl text-gray-400 dark:text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Your watchlist is empty
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
        Start adding movies and TV shows you want to watch!
      </p>
      <Link
        to="/"
        className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md transition-all duration-300"
      >
        Browse Movies
      </Link>
    </div>
  );
};

export default EmptyWatchlist;
