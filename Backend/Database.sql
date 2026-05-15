package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.io.FileWriter;
import java.io.PrintWriter;

public class Database {
    private static final String URL = "jdbc:mysql://localhost:3306/movierental?createDatabaseIfNotExist=true&useSSL=false";
    private static final String USER = "root";
    private static final String PASSWORD = "0000";

    public static Connection getConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (Exception e) {
            System.err.println("Database connection failed: " + e.getMessage());
            return null;
        }
    }

    public static void initializeDatabase() {
        String[] tables = {
            "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(100) NOT NULL, role VARCHAR(20) DEFAULT 'USER')",
            "CREATE TABLE IF NOT EXISTS movies (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, genre VARCHAR(50) NOT NULL, year INT NOT NULL, price DOUBLE NOT NULL, available BOOLEAN DEFAULT TRUE, image_url VARCHAR(500))",
            "CREATE TABLE IF NOT EXISTS rentals (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, movie_id INT, rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, due_date TIMESTAMP, returned BOOLEAN DEFAULT FALSE, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (movie_id) REFERENCES movies(id))",
            "CREATE TABLE IF NOT EXISTS reviews (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, movie_id INT, rating INT, comment TEXT, is_critic BOOLEAN DEFAULT FALSE, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (movie_id) REFERENCES movies(id))",
            "CREATE TABLE IF NOT EXISTS watchlist (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, movie_id INT, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (movie_id) REFERENCES movies(id))",
            "CREATE TABLE IF NOT EXISTS invoices (id INT AUTO_INCREMENT PRIMARY KEY, rental_id INT, amount DOUBLE, payment_method VARCHAR(50), status VARCHAR(50) DEFAULT 'Paid', FOREIGN KEY (rental_id) REFERENCES rentals(id))",
            "INSERT IGNORE INTO users (id, username, email, password, role) VALUES (1, 'Admin', 'admin@test.com', 'admin123', 'ADMIN'), (2, 'TestUser', 'user@test.com', 'user123', 'USER')"
        };

        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            for (String query : tables) {
                stmt.execute(query);
            }
            System.out.println("Database tables initialized successfully.");
        } catch (Exception e) {
            System.err.println("Database initialization failed: " + e.getMessage());
        }
    }


    // Auto-update text files
    public static void exportTableToFile(String tableName, String fileName) {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName);
             PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            
            int columnCount = rs.getMetaData().getColumnCount();
            while (rs.next()) {
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= columnCount; i++) {
                    sb.append(rs.getString(i));
                    if (i < columnCount) sb.append(",");
                }
                writer.println(sb.toString());
            }
        } catch (Exception e) {
            System.err.println("Error exporting to file " + fileName + ": " + e.getMessage());
        }
    }

    public static void autoUpdateAllFiles() {
        exportTableToFile("users", "users.txt");
        exportTableToFile("movies", "movies.txt");
        exportCustomRentalsToFile("rentals.txt");
        exportCustomReviewsToFile("reviews.txt");
        exportCustomWatchlistToFile("watchlist.txt");
        exportCustomInvoicesToFile("invoices.txt");
    }

    public static void exportCustomRentalsToFile(String fileName) {
        String sql = "SELECT r.id, u.username, m.title, r.rental_date, r.due_date, r.returned " +
                     "FROM rentals r " +
                     "JOIN users u ON r.user_id = u.id " +
                     "JOIN movies m ON r.movie_id = m.id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql);
             PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            
            writer.println("Rental ID, User, Movie Name, Rented Date, Due Date, Returned");
            while (rs.next()) {
                writer.println(rs.getInt("id") + "," + 
                               rs.getString("username") + "," + 
                               rs.getString("title") + "," + 
                               rs.getString("rental_date") + "," + 
                               rs.getString("due_date") + "," + 
                               rs.getBoolean("returned"));
            }
        } catch (Exception e) {
            System.err.println("Error exporting custom rentals to file: " + e.getMessage());
        }
    }

    public static void exportCustomWatchlistToFile(String fileName) {
        String sql = "SELECT w.id, u.username, m.title FROM watchlist w JOIN users u ON w.user_id = u.id JOIN movies m ON w.movie_id = m.id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql);
             PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            writer.println("Watchlist ID, Username, Movie Name");
            while (rs.next()) {
                writer.println(rs.getInt("id") + "," + rs.getString("username") + "," + rs.getString("title"));
            }
        } catch (Exception e) {
            System.err.println("Error exporting custom watchlist: " + e.getMessage());
        }
    }

    public static void exportCustomInvoicesToFile(String fileName) {
        String sql = "SELECT i.id, u.username, m.title, i.amount, i.status FROM invoices i JOIN rentals r ON i.rental_id = r.id JOIN users u ON r.user_id = u.id JOIN movies m ON r.movie_id = m.id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql);
             PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            writer.println("Invoice ID, Username, Movie Name, Amount, Status");
            while (rs.next()) {
                writer.println(rs.getInt("id") + "," + rs.getString("username") + "," + rs.getString("title") + "," + rs.getDouble("amount") + "," + rs.getString("status"));
            }
        } catch (Exception e) {
            System.err.println("Error exporting custom invoices: " + e.getMessage());
        }
    }

    public static void exportCustomReviewsToFile(String fileName) {
        String sql = "SELECT r.id, m.title, u.username, r.rating, r.comment FROM reviews r JOIN movies m ON r.movie_id = m.id JOIN users u ON r.user_id = u.id";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql);
             PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            writer.println("Review ID, Movie Name, Username, Rating, Comment");
            while (rs.next()) {
                writer.println(rs.getInt("id") + "," + rs.getString("title") + "," + rs.getString("username") + "," + rs.getInt("rating") + " Stars," + rs.getString("comment"));
            }
        } catch (Exception e) {
            System.err.println("Error exporting custom reviews: " + e.getMessage());
        }
    }
}

