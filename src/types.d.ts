export interface ITheme {
  title: string;
  icon: IconType;
}

export interface INavLink extends ITheme {
  path: string;
}

export interface IMovie {
  id: string;
  poster_path: string;
  original_title: string;
  name: string;
  overview: string;
  backdrop_path: string
}

export interface IWatchlistItem extends IMovie {
  media_type: 'movie' | 'tv';
  added_at: number;
}

export interface IWatchlistContext {
  watchlist: IWatchlistItem[];
  isInWatchlist: (id: string) => boolean;
  addToWatchlist: (item: IMovie, mediaType: 'movie' | 'tv') => void;
  removeFromWatchlist: (id: string) => void;
  clearWatchlist: () => void;
  watchlistCount: number;
}

