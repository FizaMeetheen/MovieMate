import React, { useState, useEffect } from "react";

function MovieDetails({ movie, setSelectedMovie, setMovies }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Initialize reviews and fetch recommendations
  useEffect(() => {
    setRating(0);
    setReview("");

    
    if (movie.review) {
      try {
        const parsed = JSON.parse(movie.review);
        setUserReviews(parsed);
      } catch {
        setUserReviews([]);
      }
    } else {
      setUserReviews([]);
    }

    // Fetch AI recommendations
    setLoadingRecommendations(true);
    fetch(`http://127.0.0.1:5000/movies/${movie.id}/recommend`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoadingRecommendations(false);
      })
      .catch(err => {
        console.error("Failed to fetch recommendations", err);
        setLoadingRecommendations(false);
      });

  }, [movie]);

  // Handle review submission
  const handleSave = async () => {
    if (!review.trim() || Number(rating) === 0) {
      alert("Please provide both rating and review!");
      return;
    }

    const newReview = { rating, review };
    setLoadingReview(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/movies/${movie.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add review");

      // Update local reviews state
      const updatedReviews = [...userReviews, newReview];
      setUserReviews(updatedReviews);

      // Update parent movies state
      setMovies(prev =>
        prev.map(m => m.id === movie.id ? { ...m, review: JSON.stringify(updatedReviews) } : m)
      );

      // Reset form
      setRating(0);
      setReview("");

    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Try again.");
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(15px)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "15px",
          }}
        >
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title">{movie.title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setSelectedMovie(null)}
            ></button>
          </div>

          <div className="modal-body">
            <p><strong>Director:</strong> {movie.director}</p>

            <div>
              <strong>Rating:</strong>{" "}
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{ cursor: "pointer", color: star <= rating ? "gold" : "gray", fontSize: "1.2rem" }}
                  onClick={() => setRating(star)}
                >★</span>
              ))}
            </div>

            <div className="mt-3">
              <strong>Your Review:</strong>
              <textarea
                className="form-control mt-1"
                rows="3"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{ backgroundColor: "#1c1c1c", color: "white", border: "1px solid #555" }}
              />
            </div>

            <button
              className="btn btn-danger mt-2"
              onClick={handleSave}
              disabled={loadingReview}
            >
              {loadingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          <div className="px-3 pb-3">
            <h6 className="mt-3">User Reviews:</h6>
            {userReviews.length === 0 ? <p>No reviews yet.</p> : (
              userReviews.map((r, idx) => (
                <div
                  key={idx}
                  className="p-2 my-2 rounded"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}
                >
                  <div>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ color: star <= r.rating ? "gold" : "gray", fontSize: "1rem" }}>★</span>
                    ))}
                  </div>
                  <p className="mb-0">{r.review}</p>
                </div>
              ))
            )}
          </div>

          {loadingRecommendations ? (
            <p className="px-3">Loading recommendations...</p>
          ) : recommendations.length > 0 && (
            <div className="px-3 pb-3">
              <h6 className="mt-3">Recommended for You:</h6>
              <div className="d-flex overflow-auto gap-3">
                {recommendations.map(m => (
                  <div
                    key={m.id}
                    className="rounded"
                    style={{
                      minWidth: "150px",
                      background: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(10px)",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedMovie(m)}
                  >
                    <img
                      src={m.image || `https://placehold.co/150x200?text=${m.title}`}
                      alt={m.title}
                      style={{ width: "100%", borderRadius: "10px 10px 0 0", objectFit: "cover" }}
                    />
                    <p className="mb-1 mt-1" style={{ fontSize: "0.85rem" }}>{m.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
