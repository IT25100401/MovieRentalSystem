// --- MEMBER 5: Watchlist ---
    public static class Watchlist {
        private int id;
        private int userId;
        private int movieId;

        public Watchlist() {}
        public Watchlist(int id, int userId, int movieId) {
            this.id = id; this.userId = userId; this.movieId = movieId;
        }

        public int getId() { return id; }
        public int getUserId() { return userId; }
        public int getMovieId() { return movieId; }

        @Override
        public String toString() {
            return id + "," + userId + "," + movieId;
        }
    }
