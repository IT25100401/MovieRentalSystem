package org.example.crud.member5;

import org.example.Database;
import org.example.Models.Watchlist;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class WatchlistFavoritesManager {

    // Create: Add movie to personalized watchlist
    public static boolean addToPersonalWatchlist(Watchlist watchlist) {
        String checkSql = "SELECT COUNT(*) FROM watchlist WHERE user_id=? AND movie_id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, watchlist.getUserId());
            checkStmt.setInt(2, watchlist.getMovieId());
            ResultSet rs = checkStmt.executeQuery();
            if (rs.next() && rs.getInt(1) > 0) {
                return false; // Prevent duplicates
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        String sql = "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, watchlist.getUserId());
            stmt.setInt(2, watchlist.getMovieId());
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update watchlist.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Read: View saved favorites list
    public static List<Watchlist> viewSavedFavoritesList(int userId) {
        List<Watchlist> list = new ArrayList<>();
        String sql = "SELECT * FROM watchlist WHERE user_id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                list.add(new Watchlist(
                        rs.getInt("id"), rs.getInt("user_id"),
                        rs.getInt("movie_id")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // Update: Reorganize or categorize the watchlist 
    public static boolean reorganizeWatchlistCategory(int watchlistId, int newMovieId) {
        String sql = "UPDATE watchlist SET movie_id=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, newMovieId);
            stmt.setInt(2, watchlistId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update watchlist.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Delete: Remove movie from watchlist
    public static boolean removeMovieFromWatchlist(int watchlistId) {
        String sql = "DELETE FROM watchlist WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, watchlistId);
            int rows = stmt.executeUpdate();
            Database.autoUpdateAllFiles(); // Auto update watchlist.txt
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
