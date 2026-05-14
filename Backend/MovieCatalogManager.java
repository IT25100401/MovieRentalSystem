package org.example.crud.member2;

import org.example.Database;
import org.example.Models.Movie;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MovieCatalogManager {

    // Create: Add new movie title (movies.txt)
    public static boolean addMovieTitle(Movie movie) {
        String sql = "INSERT INTO movies (title, genre, year, price, available, image_url) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, movie.getTitle());
            stmt.setString(2, movie.getGenre());
            stmt.setInt(3, movie.getYear());
            stmt.setDouble(4, movie.getPrice());
            stmt.setBoolean(5, movie.isAvailable());
            stmt.setString(6, movie.getImageUrl());
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update movies.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Read: View movie details (search/filter by genre, year)
    public static List<Movie> searchMoviesByGenreAndYear(String genre, int year) {
        List<Movie> movies = new ArrayList<>();
        String sql = "SELECT * FROM movies WHERE genre LIKE ? AND year = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, "%" + genre + "%");
            stmt.setInt(2, year);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                movies.add(new Movie(
                        rs.getInt("id"), rs.getString("title"),
                        rs.getString("genre"), rs.getInt("year"),
                        rs.getDouble("price"), rs.getBoolean("available"),
                        rs.getString("image_url")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return movies;
    }

    public static List<Movie> getAllMovies() {
        List<Movie> movies = new ArrayList<>();
        String sql = "SELECT * FROM movies";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                movies.add(new Movie(
                        rs.getInt("id"), rs.getString("title"),
                        rs.getString("genre"), rs.getInt("year"),
                        rs.getDouble("price"), rs.getBoolean("available"),
                        rs.getString("image_url")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return movies;
    }

    // Update: Edit movie info (price, availability status)
    public static boolean editMovieInfo(int movieId, double newPrice, boolean newAvailability) {
        String sql = "UPDATE movies SET price=?, available=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, newPrice);
            stmt.setBoolean(2, newAvailability);
            stmt.setInt(3, movieId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles();  //Auto update movies.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Update: Edit movie poster URL
    public static boolean updateMoviePoster(int movieId, String newImageUrl) {
        String sql = "UPDATE movies SET image_url=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newImageUrl);
            stmt.setInt(2, movieId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update movies.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Delete: Remove movie from catalog
    public static boolean removeMovie(int movieId) {
        String[] dependencySqls = {
            "DELETE FROM invoices WHERE rental_id IN (SELECT id FROM rentals WHERE movie_id=?)",
            "DELETE FROM rentals WHERE movie_id=?",
            "DELETE FROM reviews WHERE movie_id=?",
            "DELETE FROM watchlist WHERE movie_id=?"
        };

        try (Connection conn = Database.getConnection()) {
            // Delete dependent records first to avoid foreign key constraints
            for (String depSql: dependencySqls) {
                try (PreparedStatement stmt = conn.prepareStatement(depSql)) {
                    stmt.setInt(1, movieId);
                    stmt.executeUpdate();
                }
            }

            String sql = "DELETE FROM movies WHERE id=?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, movieId);
                int rows = stmt.executeUpdate();
                Database.autoUpdateAllFiles(); // Auto update movies.txt
                return rows > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
