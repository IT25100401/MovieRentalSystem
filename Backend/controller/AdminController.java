package com.movie.rental.controller;

import com.movie.rental.model.Role;
import com.movie.rental.model.User;
import com.movie.rental.repository.RentalRepository;
import com.movie.rental.repository.ReviewRepository;
import com.movie.rental.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000"})
public class AdminController {

    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final ReviewRepository reviewRepository;

    public AdminController(UserRepository userRepository, RentalRepository rentalRepository, ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.rentalRepository = rentalRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", user.getId());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    map.put("role", user.getRole() != null ? user.getRole().name() : "CUSTOMER");
                    map.put("active", user.isActive());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot delete admin accounts.");
        }

        // Soft delete — disable the account so user sees a message
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok("User account disabled successfully.");
    }

    @PutMapping("/users/{userId}/enable")
    public ResponseEntity<?> enableUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        user.setActive(true);
        userRepository.save(user);
        return ResponseEntity.ok("User account enabled successfully.");
    }

    @DeleteMapping("/users/{userId}/permanent")
    public ResponseEntity<?> permanentDeleteUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot delete admin accounts.");
        }

        // Delete user's rentals and reviews first, then the user
        rentalRepository.deleteAll(rentalRepository.findByUserId(userId));
        reviewRepository.deleteAll(reviewRepository.findByUserId(userId));
        userRepository.delete(user);

        return ResponseEntity.ok("User account permanently deleted.");
    }

    @GetMapping("/stats/rentals")
    public ResponseEntity<?> getRentalStats() {
        var stats = new java.util.HashMap<String, Object>();

        var allRentals = rentalRepository.findAll();

        // Group by movie
        var movieBuyers = new java.util.HashMap<Long, Long>();
        var movieRenters = new java.util.HashMap<Long, Long>();
        var tvBuyers = new java.util.HashMap<Long, Long>();
        var tvRenters = new java.util.HashMap<Long, Long>();

        for (var rental : allRentals) {
            if (rental.getMovie() != null) {
                Long mid = rental.getMovie().getId();
                if (rental.getStatus() == com.movie.rental.model.RentalStatus.BOUGHT) {
                    movieBuyers.merge(mid, 1L, Long::sum);
                } else if (rental.getStatus() == com.movie.rental.model.RentalStatus.RENTED) {
                    movieRenters.merge(mid, 1L, Long::sum);
                }
            }
            if (rental.getTvSeries() != null) {
                Long tid = rental.getTvSeries().getId();
                if (rental.getStatus() == com.movie.rental.model.RentalStatus.BOUGHT) {
                    tvBuyers.merge(tid, 1L, Long::sum);
                } else if (rental.getStatus() == com.movie.rental.model.RentalStatus.RENTED) {
                    tvRenters.merge(tid, 1L, Long::sum);
                }
            }
        }

        stats.put("movieBuyers", movieBuyers);
        stats.put("movieRenters", movieRenters);
        stats.put("tvBuyers", tvBuyers);
        stats.put("tvRenters", tvRenters);

        return ResponseEntity.ok(stats);
    }
}
