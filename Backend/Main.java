
        // Define API Endpoints
        // MEMBER 2: Movie Catalog Management
        server.createContext("/api/movies", new MovieHandler());


// --- MEMBER 2: Movie Catalog Management ---
    static class MovieHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equals(exchange.getRequestMethod())) { handleOptions(exchange); return; }
            
            String query = exchange.getRequestURI().getQuery();
            int movieId = -1;
            if (query != null && query.contains("id=")) {
                try { movieId = Integer.parseInt(query.split("id=")[1].split("&")[0]); } catch(Exception e){}
            }

            if ("GET".equals(exchange.getRequestMethod())) {
                List<Models.Movie> movies = MovieCatalogManager.getAllMovies();
                sendResponse(exchange, 200, movies);
            } else if ("POST".equals(exchange.getRequestMethod())) {
                Models.Movie movie = gson.fromJson(readBody(exchange), Models.Movie.class);
                boolean success = MovieCatalogManager.addMovieTitle(movie);
                if (success) sendResponse(exchange, 201, "Movie created successfully");
                else sendResponse(exchange, 500, "Error adding movie");
            } else if ("PUT".equals(exchange.getRequestMethod())) {
                Models.Movie updateData = gson.fromJson(readBody(exchange), Models.Movie.class);
                boolean success;
                if (updateData.getImageUrl() != null && !updateData.getImageUrl().isEmpty()) {
                    success = MovieCatalogManager.updateMoviePoster(movieId, updateData.getImageUrl());
                } else {
                    success = MovieCatalogManager.editMovieInfo(movieId, updateData.getPrice(), updateData.isAvailable());
                }
                if (success) sendResponse(exchange, 200, "Movie updated");
                else sendResponse(exchange, 500, "Update failed");
            } else if ("DELETE".equals(exchange.getRequestMethod())) {
                boolean success = MovieCatalogManager.removeMovie(movieId);
                if (success) sendResponse(exchange, 200, "Movie deleted");
                else sendResponse(exchange, 500, "Deletion failed");
            }
        }
    }
