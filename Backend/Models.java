// --- MEMBER 3: Rental Transaction Management ---
    public static class Rental {
        private int id;
        private int userId;
        private int movieId;
        private String rentalDate;
        private String dueDate;
        private boolean returned;

        public Rental() {}
        public Rental(int id, int userId, int movieId, String rentalDate, String dueDate, boolean returned) {
            this.id = id; this.userId = userId; this.movieId = movieId;
            this.rentalDate = rentalDate; this.dueDate = dueDate; this.returned = returned;
        }

        public int getId() { return id; }
        public int getUserId() { return userId; }
        public int getMovieId() { return movieId; }
        public String getRentalDate() { return rentalDate; }
        public String getDueDate() { return dueDate; }
        public boolean isReturned() { return returned; }
        public void setReturned(boolean returned) { this.returned = returned; }

        public double calculateLateFee(int daysLate) {
            return daysLate > 0 ? daysLate * 1.50 : 0.0;
        }

        @Override
        public String toString() {
            return id + "," + userId + "," + movieId + "," + rentalDate + "," + dueDate + "," + returned;
        }
    }
