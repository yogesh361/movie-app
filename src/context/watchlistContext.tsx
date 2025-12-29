import React, { useContext, useState, useEffect, useCallback } from "react";
import { saveWatchlist, getWatchlist } from "@/utils/watchlistHelper";
import { IWatchlistItem, IMovie, IWatchlistContext } from "@/types";

const context = React.createContext<IWatchlistContext>({
  watchlist: [],
  isInWatchlist: () => false,
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  clearWatchlist: () => {},
  watchlistCount: 0,
});

interface Props {
  children: React.ReactNode;
}

const initialWatchlist = getWatchlist();

const WatchlistProvider = ({ children }: Props) => {
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>(initialWatchlist);

  // Auto-save to localStorage whenever watchlist changes
  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const isInWatchlist = useCallback(
    (id: string): boolean => {
      return watchlist.some((item) => item.id === id);
    },
    [watchlist]
  );

  const addToWatchlist = useCallback(
    (movie: IMovie, mediaType: 'movie' | 'tv') => {
      setWatchlist((prev) => {
        // Prevent duplicates
        if (prev.some((item) => item.id === movie.id)) {
          return prev;
        }
        // Add to beginning with metadata
        return [
          {
            ...movie,
            media_type: mediaType,
            added_at: Date.now(),
          },
          ...prev,
        ];
      });
    },
    []
  );

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return (
    <context.Provider
      value={{
        watchlist,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        clearWatchlist,
        watchlistCount: watchlist.length,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default WatchlistProvider;

export const useWatchlist = () => {
  return useContext(context);
};
