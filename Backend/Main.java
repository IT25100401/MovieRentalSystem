// MEMBER 4: Movie Review & Feedback
        server.createContext("/api/reviews", new ReviewHandler());


// --- MEMBER 4: Movie Review & Feedback ---
    static class ReviewHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equals(exchange.getRequestMethod())) { handleOptions(exchange); return; }
            if ("POST".equals(exchange.getRequestMethod())) {
                Models.Review review = gson.fromJson(readBody(exchange), Models.Review.class);
                boolean success = ReviewFeedbackManager.submitMovieReview(review);
                if (success) sendResponse(exchange, 201, "Review added");
                else sendResponse(exchange, 500, "Review failed");
            } else if ("GET".equals(exchange.getRequestMethod())) {
                List<java.util.Map<String, Object>> reviews = new java.util.ArrayList<>();
                String sql = "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id";
                try (java.sql.Connection conn = Database.getConnection();
                     java.sql.Statement stmt = conn.createStatement();
                     java.sql.ResultSet rs = stmt.executeQuery(sql)) {
                    while (rs.next()) {
                        java.util.Map<String, Object> rev = new java.util.HashMap<>();
                        rev.put("id", rs.getInt("id"));
                        rev.put("userId", rs.getInt("user_id"));
                        rev.put("movieId", rs.getInt("movie_id"));
                        rev.put("rating", rs.getInt("rating"));
                        rev.put("comment", rs.getString("comment"));
                        rev.put("username", rs.getString("username"));
                        reviews.add(rev);
                    }
                } catch (Exception e) {}
                sendResponse(exchange, 200, reviews);
            } else if ("DELETE".equals(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                int reviewId = -1;
                if (query != null && query.contains("id=")) {
                    try { reviewId = Integer.parseInt(query.split("id=")[1].split("&")[0]); } catch(Exception e){}
                }
                boolean success = ReviewFeedbackManager.removeReview(reviewId);
                if (success) sendResponse(exchange, 200, "Review deleted");
                else sendResponse(exchange, 500, "Deletion failed");
            }
        }
    }
