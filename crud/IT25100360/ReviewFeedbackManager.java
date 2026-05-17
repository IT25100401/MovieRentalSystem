package org.example.crud.member4;

import org.example.Database;
import org.example.Models.Review;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ReviewFeedbackManager {

    // Create: Submit a new movie review and star rating (reviews.txt)
    public static boolean submitMovieReview(Review review) {
        String sql = "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, review.getUserId());
            stmt.setInt(2, review.getMovieId());
            stmt.setInt(3, review.getRating());
            stmt.setString(4, review.getComment());
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update reviews.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Read: View all reviews for a specific movie or user
    public static List<Review> viewReviewsForMovie(int movieId) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT * FROM reviews WHERE movie_id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, movieId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                reviews.add(new Review(
                        rs.getInt("id"), rs.getInt("user_id"),
                        rs.getInt("movie_id"), rs.getInt("rating"),
                        rs.getString("comment")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    public static List<Review> viewReviewsByUser(int userId) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT * FROM reviews WHERE user_id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                reviews.add(new Review(
                        rs.getInt("id"), rs.getInt("user_id"),
                        rs.getInt("movie_id"), rs.getInt("rating"),
                        rs.getString("comment")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    // Update: Edit a previously submitted review or rating
    public static boolean editSubmittedReview(int reviewId, int newRating, String newComment) {
        String sql = "UPDATE reviews SET rating=?, comment=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newRating);
            stmt.setString(2, newComment);
            stmt.setInt(3, reviewId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update reviews.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Delete: Remove a review
    public static boolean removeReview(int reviewId) {
        String sql = "DELETE FROM reviews WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, reviewId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update reviews.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
