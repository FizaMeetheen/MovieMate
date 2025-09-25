
MovieMate 
Track and manage your personal movie and TV show collection.

<!-- ##  Features -->
- Add movies/TV shows with title, director, genre, platform (Netflix, Prime, etc.), status (watching, completed, wishlist)
- Track progress for TV shows (episodes watched)
- Rate and review content
- Filter/sort by genre, platform, or status
- AI-powered recommendations (using scikit-learn)

<!-- ## 🛠 Tech Stack -->
- Frontend: React + Vite
- Backend: Flask (Python)
- Database: SQLite
- AI: scikit-learn (recommendations)

<!-- ##  Setup -->

<!-- ### Backend -->

cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
flask run

 <!-- FRONTEND -->
cd frontend
npm install
npm start


 API Endpoints

GET /movies → List all movies

POST /movies → Add a new movie

PATCH /movies/<id> → Update episodes watched

DELETE /movies/<id> → Delete a movie

POST /movies/<id>/review → Add a review

GET /movies/<id>/recommend → Get AI-powered recommendations