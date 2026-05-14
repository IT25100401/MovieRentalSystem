package org.example.crud.member3;

import org.example.Database;
import org.example.Models.Rental;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RentalTransactionManager {

    // Create: Process new rental transaction (rentals.txt)
    public static boolean processRentalTransaction(Rental rental) {
        String sql = "INSERT INTO rentals (user_id, movie_id, due_date, returned) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY), ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, rental.getUserId());
            stmt.setInt(2, rental.getMovieId());
            stmt.setBoolean(3, false); // New rentals are not returned
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update rentals.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Read: View current active rentals and due dates
    public static List<Rental> viewActiveRentals() {
        List<Rental> rentals = new ArrayList<>();
        String sql = "SELECT * FROM rentals WHERE returned = false";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
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

    // Update: Renew rental or mark as returned
    public static boolean renewOrReturnRental(int rentalId, String newDueDate, boolean markReturned) {
        String sql = "UPDATE rentals SET due_date=?, returned=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newDueDate);
            stmt.setBoolean(2, markReturned);
            stmt.setInt(3, rentalId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update rentals.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Delete: Cancel pending rental request
    public static boolean cancelRentalRequest(int rentalId) {
        String sql = "DELETE FROM rentals WHERE id=? AND returned = false";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, rentalId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update rentals.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
