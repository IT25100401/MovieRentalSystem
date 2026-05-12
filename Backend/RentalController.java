package com.movie.rental.controller;

import com.movie.rental.dto.RentalDto;
import com.movie.rental.model.Movie;
import com.movie.rental.model.Rental;
import com.movie.rental.model.RentalStatus;
import com.movie.rental.model.User;
import com.movie.rental.repository.MovieRepository;
import com.movie.rental.repository.RentalRepository;
import com.movie.rental.repository.UserRepository;
import com.movie.rental.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rentals")
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    private final RentalRepository rentalRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public RentalController(RentalRepository rentalRepository, MovieRepository movieRepository, UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public List<RentalDto> getMyRentals() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        return rentalRepository.findByUserId(userDetails.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/rent/{movieId}")
    public ResponseEntity<?> rentMovie(@PathVariable Long movieId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElseThrow();

        if (!movie.isAvailable()) {
            return ResponseEntity.badRequest().body("Movie is not available for rent.");
        }

        movie.setAvailable(false);
        movieRepository.save(movie);

        Rental rental = new Rental();
        rental.setUser(user);
        rental.setMovie(movie);
        rental.setRentalDate(LocalDateTime.now());
        rental.setStatus(RentalStatus.RENTED);

        rentalRepository.save(rental);

        return ResponseEntity.ok("Movie rented successfully.");
    }

    @PostMapping("/return/{rentalId}")
    public ResponseEntity<?> returnMovie(@PathVariable Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId).orElseThrow();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        if (!rental.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("You can only return your own rentals.");
        }

        if (rental.getStatus() == RentalStatus.RETURNED) {
            return ResponseEntity.badRequest().body("Movie is already returned.");
        }

        rental.setStatus(RentalStatus.RETURNED);
        rental.setReturnDate(LocalDateTime.now());
        rentalRepository.save(rental);

        Movie movie = rental.getMovie();
        movie.setAvailable(true);
        movieRepository.save(movie);

        return ResponseEntity.ok("Movie returned successfully.");
    }

    private RentalDto convertToDto(Rental rental) {
        RentalDto dto = new RentalDto();
        dto.setId(rental.getId());
        dto.setUserId(rental.getUser().getId());
        dto.setMovieId(rental.getMovie().getId());
        dto.setMovieTitle(rental.getMovie().getTitle());
        dto.setRentalDate(rental.getRentalDate());
        dto.setReturnDate(rental.getReturnDate());
        dto.setStatus(rental.getStatus().name());
        return dto;
    }
}
