package org.example;

import java.util.Date;
import java.util.List;

public class Models {

    // --- MEMBER 1: User Account & Authentication ---
    // Encapsulation
    public static class User {
        protected int id;
        protected String username;
        protected String email;
        protected String password;
        protected String role;

        public User() {}
        public User(int id, String username, String email, String password, String role) {
            this.id = id; this.username = username; this.email = email; this.password = password; this.role = role;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        // Polymorphism
        public String getDashboardAccess() {
            return "User Dashboard";
        }
        
        @Override
        public String toString() {
            return id + "," + username + "," + email + "," + role;
        }
    }

    // Inheritance
    public static class Admin extends User {
        public Admin(int id, String username, String email, String password) {
            super(id, username, email, password, "ADMIN");
        }

        @Override
        public String getDashboardAccess() {
            return "Admin Dashboard (Full Access)";
        }
    }

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

    // --- MEMBER 4: Movie Review & Feedback ---
    public static class Review {
        protected int id;
        protected int userId;
        protected int movieId;
        protected int rating;
        protected String comment;

        public Review() {}
        public Review(int id, int userId, int movieId, int rating, String comment) {
            this.id = id; this.userId = userId; this.movieId = movieId;
            this.rating = rating; this.comment = comment;
        }

        public int getId() { return id; }
        public int getUserId() { return userId; }
        public int getMovieId() { return movieId; }
        public int getRating() { return rating; }
        public String getComment() { return comment; }

        public String getDisplayFormat() {
            return "Rating: " + rating + " Stars - " + comment;
        }

        @Override
        public String toString() {
            return id + "," + userId + "," + movieId + "," + rating + "," + comment;
        }
    }

    public static class CriticReview extends Review {
        public CriticReview(int id, int userId, int movieId, int rating, String comment) {
            super(id, userId, movieId, rating, comment);
        }

        @Override
        public String getDisplayFormat() {
            return "🌟 CRITIC RATING: " + rating + "/5 - " + comment;
        }
    }


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

    // --- MEMBER 6: Payment & Billing ---
    public static class Invoice {
        protected int id;
        protected int rentalId;
        protected double amount;
        protected String status;

        public Invoice() {}
        public Invoice(int id, int rentalId, double amount, String status) {
            this.id = id; this.rentalId = rentalId; this.amount = amount; this.status = status;
        }

        public int getId() { return id; }
        public int getRentalId() { return rentalId; }
        public double getAmount() { return amount; }
        public String getStatus() { return status; }
        
        @Override
        public String toString() {
            return id + "," + rentalId + "," + amount + "," + status;
        }
    }

    public static abstract class Payment {
        public abstract boolean processPayment(double amount);
    }

    public static class CreditCardPayment extends Payment {
        @Override
        public boolean processPayment(double amount) {
            System.out.println("Processed $" + amount + " via Credit Card.");
            return true;
        }
    }

    public static class WalletPayment extends Payment {
        @Override
        public boolean processPayment(double amount) {
            System.out.println("Processed $" + amount + " via Digital Wallet.");
            return true;
        }
    }
}

