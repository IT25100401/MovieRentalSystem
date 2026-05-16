// --- MEMBER 2: Movie Catalog Management ---
    public static class Movie {
        protected int id;
        protected String title;
        protected String genre;
        protected int year;
        protected double price;
        protected boolean available;
        protected String imageUrl;

        public Movie() {}
        public Movie(int id, String title, String genre, int year, double price, boolean available, String imageUrl) {
            this.id = id; this.title = title; this.genre = genre; this.year = year; 
            this.price = price; this.available = available; this.imageUrl = imageUrl;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getTitle() { return title; }
        public String getGenre() { return genre; }
        public int getYear() { return year; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
        public String getImageUrl() { return imageUrl; }

        // Polymorphism
        public String getDisplayIcon() {
            return "🎬";
        }

        @Override
        public String toString() {
            return id + "," + title + "," + genre + "," + year + "," + price + "," + available;
        }
    }

    public static class ActionMovie extends Movie {
        public ActionMovie(int id, String title, int year, double price, boolean available, String imageUrl) {
            super(id, title, "Action", year, price, available, imageUrl);
        }
        @Override
        public String getDisplayIcon() { return "💥"; }
    }

    public static class ComedyMovie extends Movie {
        public ComedyMovie(int id, String title, int year, double price, boolean available, String imageUrl) {
            super(id, title, "Comedy", year, price, available, imageUrl);
        }
        @Override
        public String getDisplayIcon() { return "😂"; }
    }
