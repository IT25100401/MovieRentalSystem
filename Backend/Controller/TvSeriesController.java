package com.movie.rental.controller;

import com.movie.rental.model.TvSeries;
import com.movie.rental.repository.TvSeriesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tv-series")
@CrossOrigin(origins = "*")
public class TvSeriesController {

    private final TvSeriesRepository tvSeriesRepository;

    public TvSeriesController(TvSeriesRepository tvSeriesRepository) {
        this.tvSeriesRepository = tvSeriesRepository;
    }

    @GetMapping
    public List<TvSeries> getAllTvSeries() {
        return tvSeriesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TvSeries> getTvSeriesById(@PathVariable Long id) {
        return tvSeriesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TvSeries createTvSeries(@RequestBody TvSeries tvSeries) {
        return tvSeriesRepository.save(tvSeries);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TvSeries> updateTvSeries(@PathVariable Long id, @RequestBody TvSeries details) {
        return tvSeriesRepository.findById(id)
                .map(series -> {
                    series.setTitle(details.getTitle());
                    series.setGenre(details.getGenre());
                    series.setReleaseYear(details.getReleaseYear());
                    series.setSeasons(details.getSeasons());
                    series.setAvailable(details.isAvailable());
                    series.setImageUrl(details.getImageUrl());
                    series.setBackgroundUrl(details.getBackgroundUrl());
                    series.setDescription(details.getDescription());
                    series.setPrice(details.getPrice());
                    series.setRentalPrice(details.getRentalPrice());
                    return ResponseEntity.ok(tvSeriesRepository.save(series));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTvSeries(@PathVariable Long id) {
        return tvSeriesRepository.findById(id)
                .map(series -> {
                    tvSeriesRepository.delete(series);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
