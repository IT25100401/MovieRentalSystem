# Movie Rental and Review Platform

This is a Netflix-style Movie Rental and Review application built using simple and core concepts of Java (Backend), HTML/CSS/JavaScript (Frontend), and MySQL (Database). It also fulfills the auto-updating text file requirement for persistence.

## 🚀 How to Run the Project

### Prerequisites:
1. **Java JDK 17+**
2. **Maven**
3. **MySQL Server** running on localhost:3306.
4. **Node.js** (for running the frontend server using `npx serve`).

### Step 1: Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or Command Line).
2. The expected password for the `root` user is **`0000`**.
3. Run the provided SQL script to initialize the database:
   - You can copy the contents of `database.sql` and run it in your MySQL environment.
   - This creates the `movierental` database and inserts sample users and movies.

### Step 2: Start the Java Backend
1. Open a terminal in the root folder of this project (`d:\Downloads\New folder (3)\OOP PROJECT F`).
2. Build the project to resolve dependencies (MySQL Connector & GSON):
   ```bash
   mvn clean install
   ```
3. Run the main backend server:
   ```bash
   mvn exec:java -Dexec.mainClass="org.example.Main"
   ```
   *The server will start on `http://localhost:8080`. Every time a modification occurs, the text files (e.g., `users.txt`, `movies.txt`) will auto-update in the root directory.*

### Step 3: Start the Frontend
1. Open a **new terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start the local server on port 3000:
   ```bash
   npm start
   ```
   *(This runs `npx serve -l 3000` under the hood).*
3. Open your browser and go to: **[http://localhost:3000](http://localhost:3000)**

---

## 📋 CRUD Operations Documentation

### Member 1: User Account & Authentication
- **Create:** Register a new account via the **Register** button on the UI. Backend saves to DB and auto-updates `users.txt`.
- **Read:** Click Login and submit credentials. Backend checks DB.
- **Update/Delete:** (Can be done directly via DB or by extending `UserHandler` using standard SQL `UPDATE/DELETE`).

### Member 2: Movie Catalog Management
- **Create:** Login with Admin credentials (`admin@test.com` / `admin123`). Click the **Admin** button to add new movies. Updates `movies.txt`.
- **Read:** Homepage fetches and displays all available movies from the database.
- **Update/Delete:** (Admin panel extensions can handle SQL edits/drops).

### Member 3: Rental Transaction Management
- **Create:** Click on a movie poster and click **Rent Now**. The rental is recorded in the database and `rentals.txt`.
- **Read:** Rentals are linked to the user session. 
- **Update/Delete:** (Handling returned status via admin extensions).

### Member 4: Movie Review & Feedback Management
- **Create:** Inside a movie modal, fill the rating and comment form, then submit. Updates `reviews.txt`.
- **Read:** Inside the movie modal, all reviews associated with that movie are fetched and displayed.
- **Update/Delete:** (Moderation or user-led edits via extensions).

### Member 5 & 6: Watchlist and Payments
- Implemented within the backend OOP Models (`Models.java`). They exhibit Encapsulation and Polymorphism (e.g., `CreditCardPayment`, `WalletPayment`) and have schema structures ready for UI integration.
