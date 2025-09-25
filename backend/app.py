from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
CORS(app)

# SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Movie model
class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    director = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(100), nullable=False)  # comma-separated
    platform = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    episodesWatched = db.Column(db.Integer, default=0)
    totalEpisodes = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    review = db.Column(db.String, default="")  # JSON string of reviews
    image = db.Column(db.String(250), default="")

# Create tables
with app.app_context():
    db.create_all()

# Get all movies
@app.route('/movies', methods=['GET'])
def get_movies():
    movies = Movie.query.all()
    return jsonify([
        {
            "id": m.id,
            "title": m.title,
            "director": m.director,
            "genre": m.genre,
            "platform": m.platform,
            "status": m.status,
            "episodesWatched": m.episodesWatched,
            "totalEpisodes": m.totalEpisodes,
            "rating": m.rating,
            "review": m.review,
            "image": m.image
        } for m in movies
    ])

# Add movie with optional initial review
@app.route('/movies', methods=['POST'])
def add_movie():
    try:
        data = request.json

        title = data.get("title", "").strip()
        director = data.get("director", "").strip()
        platform = data.get("platform", "").strip()
        status = data.get("status", "").strip()
        if not title or not director or not platform or not status:
            return jsonify({"error": "title, director, platform, and status are required"}), 400

        genre = data.get("genre", "")
        if isinstance(genre, list):
            genre = ",".join([g.strip() for g in genre])
        elif not genre:
            genre = ""

        # Initial review
        initial_review = []
        if data.get("review") and data.get("rating") is not None:
            initial_review = [{"rating": data["rating"], "review": data["review"]}]

        new_movie = Movie(
            title=title,
            director=director,
            genre=genre,
            platform=platform,
            status=status,
            episodesWatched=int(data.get("episodesWatched", 0)),
            totalEpisodes=int(data.get("totalEpisodes", 0)),
            rating=float(data.get("rating", 0)),
            review=json.dumps(initial_review),
            image=data.get("image", "")
        )

        db.session.add(new_movie)
        db.session.commit()
        return jsonify({"message": "Movie added successfully!", "id": new_movie.id}), 201

    except Exception as e:
        print("Error adding movie:", e)
        return jsonify({"error": str(e)}), 500

# Delete movie
@app.route('/movies/<int:id>', methods=['DELETE'])
def delete_movie(id):
    movie = Movie.query.get_or_404(id)
    db.session.delete(movie)
    db.session.commit()
    return jsonify({"message": "Movie deleted successfully!"})

# Add review to a movie
@app.route('/movies/<int:id>/review', methods=['POST'])
def add_review(id):
    try:
        movie = Movie.query.get_or_404(id)
        data = request.json
        rating = float(data.get("rating", 0))
        review_text = data.get("review", "").strip()
        if not review_text or rating <= 0:
            return jsonify({"error": "Both rating and review are required"}), 400

        reviews = []
        if movie.review:
            try:
                reviews = json.loads(movie.review)
            except:
                reviews = []

        reviews.append({
            "rating": rating,
            "review": review_text
        })

        movie.review = json.dumps(reviews)
        db.session.commit()
        return jsonify({"message": "Review added successfully!"})

    except Exception as e:
        print("Error adding review:", e)
        return jsonify({"error": str(e)}), 500

# Update episodes watched
@app.route('/movies/<int:id>', methods=['PATCH'])
def update_movie(id):
    movie = Movie.query.get_or_404(id)
    data = request.json
    if "episodesWatched" in data:
        movie.episodesWatched = int(data["episodesWatched"])
    db.session.commit()
    return jsonify({"message": "Movie updated successfully!"})

# AI Recommendation based on genre + rating
@app.route('/movies/<int:id>/recommend', methods=['GET'])
def recommend_movies(id):
    movie = Movie.query.get_or_404(id)
    all_movies = Movie.query.filter(Movie.id != id).all()
    if not all_movies:
        return jsonify([])

    # Use genre similarity
    movie_genres = [m.genre for m in all_movies]
    cv = CountVectorizer()
    genre_matrix = cv.fit_transform(movie_genres)
    target_cv = cv.transform([movie.genre])
    similarity = cosine_similarity(target_cv, genre_matrix).flatten()

    recommended = sorted(
        zip(all_movies, similarity),
        key=lambda x: (x[1], x[0].rating),
        reverse=True
    )[:5]

    result = [
        {
            "id": m.id,
            "title": m.title,
            "genre": m.genre,
            "platform": m.platform,
            "status": m.status,
            "image": m.image
        }
        for m, _ in recommended
    ]
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
