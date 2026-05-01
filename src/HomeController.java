package com.movie.rental.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping(value = "/", produces = "text/html")
    public String home() {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Movie Rental System</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            line-height: 1.6;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                            color: #333;
                            background-color: #f9f9f9;
                        }
                        .container {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        h1 { color: #4f46e5; }
                        a { color: #4f46e5; text-decoration: none; font-weight: bold; }
                        a:hover { text-decoration: underline; }
                        .endpoint {
                            background: #f1f5f9;
                            padding: 10px 15px;
                            border-radius: 4px;
                            margin-bottom: 10px;
                            font-family: monospace;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Movie Rental System Backend is Running 🚀</h1>
                        <p>Welcome to the API server for the Movie Rental System. Everything is set up correctly.</p>
                        
                        <h3>Available Public Endpoints</h3>
                        <div class="endpoint">
                            <strong>GET</strong> <a href="/api/movies">/api/movies</a> - View all available movies
                        </div>
                        <div class="endpoint">
                            <strong>POST</strong> /api/auth/register - Register a new user
                        </div>
                        <div class="endpoint">
                            <strong>POST</strong> /api/auth/login - Login to receive JWT token
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                            Use the React frontend or tools like Postman to interact with the protected API endpoints.
                        </p>
                    </div>
                </body>
                </html>
                """;
    }
}
