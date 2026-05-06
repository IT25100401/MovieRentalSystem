package com.movie.rental.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String genre;

    private Integer releaseYear;

    private boolean available = true;
    
    @Column(length = 2000)
    private String imageUrl;
    
    @Column(length = 2000)
    private String backgroundUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double price = 9.99; // Default buy price

    @Column(nullable = false)
    private Double rentalPrice = 3.99; // Default rental price
}
