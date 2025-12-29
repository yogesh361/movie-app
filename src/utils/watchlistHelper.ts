import { IWatchlistItem } from "@/types";

const WATCHLIST_KEY = "tmovies_watchlist";

export const saveWatchlist = (watchlist: IWatchlistItem[]): void => {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error("Failed to save watchlist:", error);
  }
};

export const getWatchlist = (): IWatchlistItem[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load watchlist:", error);
    return [];
  }
};
