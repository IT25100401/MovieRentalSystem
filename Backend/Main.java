// MEMBER 5: Watchlist
        server.createContext("/api/watchlist", new WatchlistHandler());

// --- MEMBER 5: Watchlist ---
    static class WatchlistHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equals(exchange.getRequestMethod())) { handleOptions(exchange); return; }
            if ("POST".equals(exchange.getRequestMethod())) {
                Models.Watchlist wl = gson.fromJson(readBody(exchange), Models.Watchlist.class);
                boolean success = org.example.crud.member5.WatchlistFavoritesManager.addToPersonalWatchlist(wl);
                if (success) sendResponse(exchange, 201, "Added to watchlist");
                else sendResponse(exchange, 500, "Failed to add to watchlist");
            } else if ("GET".equals(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                int userId = -1;
                if (query != null && query.contains("userId=")) {
                    try { userId = Integer.parseInt(query.split("userId=")[1].split("&")[0]); } catch(Exception e){}
                }
                List<Models.Watchlist> list = org.example.crud.member5.WatchlistFavoritesManager.viewSavedFavoritesList(userId);
                sendResponse(exchange, 200, list);
            } else if ("DELETE".equals(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                int id = -1;
                if (query != null && query.contains("id=")) {
                    try { id = Integer.parseInt(query.split("id=")[1].split("&")[0]); } catch(Exception e){}
                }
                boolean success = org.example.crud.member5.WatchlistFavoritesManager.removeMovieFromWatchlist(id);
                if (success) sendResponse(exchange, 200, "Removed from watchlist");
                else sendResponse(exchange, 500, "Removal failed");
            }
        }
    }
