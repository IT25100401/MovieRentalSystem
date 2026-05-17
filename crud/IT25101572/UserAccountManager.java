package org.example.crud.member1;

import org.example.Database;
import org.example.Models.User;
import org.example.Models.Rental;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UserAccountManager {

    // Create: Register new user account (users.txt)
    public static boolean registerUser(User user) {
        String sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            stmt.setString(4, "USER");
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update users.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Read: Search/View user profile and rental history
    public static User viewUserProfile(int userId) {
        String sql = "SELECT * FROM users WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new User(rs.getInt("id"), rs.getString("username"),
                        rs.getString("email"), null, rs.getString("role"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static List<Rental> viewRentalHistory(int userId) {
        // First, auto-remove expired rentals (countdown finished)
        String cleanupSql = "DELETE FROM rentals WHERE due_date < CURRENT_TIMESTAMP AND returned = false";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(cleanupSql)) {
            if(stmt.executeUpdate() > 0) { Database.autoUpdateAllFiles(); }
        } catch (SQLException e) {}

        List<Rental> rentals = new ArrayList<>();
        String sql = "SELECT * FROM rentals WHERE user_id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                rentals.add(new Rental(
                        rs.getInt("id"), rs.getInt("user_id"),
                        rs.getInt("movie_id"), rs.getString("rental_date"),
                        rs.getString("due_date"), rs.getBoolean("returned")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rentals;
    }

    // Update: Edit profile details (password, email, preferences)
    public static boolean editProfileDetails(int userId, String newEmail, String newPassword) {
        String sql = "UPDATE users SET email=?, password=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newEmail);
            stmt.setString(2, newPassword);
            stmt.setInt(3, userId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update users.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Delete: Remove user account
    public static boolean removeUserAccount(int userId) {
        String sql = "DELETE FROM users WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update users.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
