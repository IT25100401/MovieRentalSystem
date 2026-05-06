package com.movie.moviereviewsystem;

import com.movie.moviereviewsystem.config.FileDataStore;
import com.movie.moviereviewsystem.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private FileDataStore dataStore;

    @GetMapping("/{movieId}")
    public List<Review> getReviewsByMovieId(@PathVariable Long movieId) {
        return dataStore.getReviewsByMovieId(movieId);
    }

    @PostMapping("/{movieId}")
    public Review addReview(@PathVariable Long movieId, @RequestBody Review review) {
        review.setMovieId(movieId);
        return dataStore.saveReview(review);
    }

    @PutMapping("/{movieId}/{reviewId}")
    public Review updateReview(@PathVariable Long movieId, @PathVariable Long reviewId, @RequestBody Review reviewUpdate) {
        return dataStore.updateReview(reviewId, reviewUpdate);
    }

    @DeleteMapping("/{movieId}/{reviewId}")
    public void deleteReview(@PathVariable Long movieId, @PathVariable Long reviewId) {
        dataStore.deleteReview(reviewId);
    }
}
