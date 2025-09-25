import React, { useState, useEffect } from "react";

function Admin({ setMovies }) {
  const [content, setContent] = useState({
    title: "",
    director: "",
    genre: "",
    platform: "Netflix",
    customPlatform: "",
    status: "Watching",
    episodesWatched: "",
    totalEpisodes: "",
    rating: 0,
    review: "",
    image: "",
  });

  // Fetch movies once when Admin loads
  useEffect(() => {
    fetch("http://127.0.0.1:5000/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, [setMovies]);

  const handleChange = (e) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleStarClick = (star) => {
    setContent((prev) => ({ ...prev, rating: star }));
  };

  const handleAddContent = async () => {
    const platform = content.platform === "Other" ? content.customPlatform : content.platform;
    if (!content.title.trim() || !content.director.trim() || !content.genre.trim() || !platform.trim()) {
      alert("Please fill all required fields!");
      return;
    }

    const newMovie = {
      title: content.title.trim(),
      director: content.director.trim(),
      genre: content.genre.trim(),
      platform,
      status: content.status,
      episodesWatched: Number(content.episodesWatched) || 0,
      totalEpisodes: Number(content.totalEpisodes) || 10,
      rating: Number(content.rating) || 0,
      review: content.review || "",
      image: content.image || "",
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie),
      });
      const data = await res.json();

      // Update movies state in parent
      setMovies((prev) => [...prev, { ...newMovie, id: data.id }]);

      // Reset form
      setContent({
        title: "",
        director: "",
        genre: "",
        platform: "Netflix",
        customPlatform: "",
        status: "Watching",
        episodesWatched: "",
        totalEpisodes: "",
        rating: 0,
        review: "",
        image: "",
      });

      alert(`Added: ${newMovie.title}`);
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Failed to add movie. Check backend!");
    }
  };

  return (
    <div style={{ backgroundColor: "rgba(14,14,41,0.91)", minHeight: "100vh", padding: "50px 20px", fontFamily: "'Oswald', sans-serif" }}>
      <div className="container">
        <div className="p-4 shadow-lg rounded mx-auto" style={{ maxWidth: "700px", backgroundColor: "rgba(255,255,255,0.05)" }}>
          <h2 className="text-center mb-4 text-white">Add Movie / TV Show</h2>

          <input type="text" name="title" placeholder="Title" value={content.title} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />
          <input type="text" name="director" placeholder="Director" value={content.director} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />
          <input type="text" name="genre" placeholder="Genre (comma-separated)" value={content.genre} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />
          <input type="text" name="image" placeholder="Image URL" value={content.image} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />

          <select name="platform" value={content.platform} onChange={handleChange} className="form-select mb-3" style={{ borderRadius: "12px" }}>
            <option>Netflix</option>
            <option>Prime</option>
            <option>Disney+</option>
            <option>Other</option>
          </select>

          {content.platform === "Other" && (
            <input type="text" name="customPlatform" placeholder="Enter Platform Name" value={content.customPlatform} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />
          )}

          <select name="status" value={content.status} onChange={handleChange} className="form-select mb-3" style={{ borderRadius: "12px" }}>
            <option>Watching</option>
            <option>Completed</option>
            <option>Wishlist</option>
          </select>

          <input type="number" name="episodesWatched" placeholder="Episodes Watched" value={content.episodesWatched} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />
          <input type="number" name="totalEpisodes" placeholder="Total Episodes" value={content.totalEpisodes} onChange={handleChange} className="form-control mb-3" style={{ borderRadius: "12px" }} />

          {/* Rating + Review */}
          <div className="mb-3">
            <strong className="text-white">Rating: </strong>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{ cursor: "pointer", color: star <= content.rating ? "gold" : "white", fontSize: "1.5rem", marginRight: "5px" }}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Initial Review (optional)"
            name="review"
            value={content.review}
            onChange={handleChange}
            className="form-control mb-3"
            rows="3"
            style={{ borderRadius: "12px" }}
          />

          <button className="btn w-100 fw-bold" style={{ backgroundColor: "#b72121d8", color: "white", borderRadius: "12px" }} onClick={handleAddContent}>
            Add Movie
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
