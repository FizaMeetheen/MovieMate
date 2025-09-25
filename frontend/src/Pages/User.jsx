import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import MovieDetails from "../Components/MovieDetails";

function User({ setMovies }) {
  const [movies, setLocalMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [filters, setFilters] = useState({ genre: [], platform: [], status: [] });
  const [genreInput, setGenreInput] = useState("");
  const carouselRef = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/movies")
      .then((res) => res.json())
      .then((data) => {
        setLocalMovies(data);
        setMovies(data);
      })
      .catch((err) => console.error("Error fetching movies:", err));

    if (carouselRef.current) {
      new bootstrap.Carousel(carouselRef.current, {
        interval: 3000,
        ride: "carousel",
        pause: false,
        wrap: true,
      });
    }
  }, [setMovies]);

  const handleViewMore = (movie) => setSelectedMovie(movie);

  const handleEpisodesChange = async (index, value) => {
    const updatedMovies = [...movies];
    updatedMovies[index] = { ...updatedMovies[index], episodesWatched: Number(value) };
    setLocalMovies(updatedMovies);
    setMovies(updatedMovies);

    try {
      await fetch(`http://127.0.0.1:5000/movies/${updatedMovies[index].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodesWatched: Number(value) }),
      });
    } catch (err) {
      console.error("Failed to update episodes:", err);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/movies/${movieId}`, { method: "DELETE" });
      if (res.ok) {
        setLocalMovies((prev) => prev.filter((m) => m.id !== movieId));
        setMovies((prev) => prev.filter((m) => m.id !== movieId));
      } else {
        alert("Failed to delete movie.");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
    }
  };

  const handleAddFilter = (type, value) => {
    if (!value.trim()) return;
    setFilters((prev) => {
      if (!prev[type].includes(value)) {
        return { ...prev, [type]: [...prev[type], value] };
      }
      return prev;
    });
  };

  const handleRemoveFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: prev[type].filter((v) => v !== value) }));
  };

  const filteredMovies = movies.filter((m) => {
    const movieGenres = m.genre.split(",").map((g) => g.trim().toLowerCase());

    const genreMatch =
      filters.genre.length === 0 || filters.genre.some((f) => movieGenres.includes(f.toLowerCase()));
    const platformMatch =
      filters.platform.length === 0 || filters.platform.some((f) => m.platform.toLowerCase() === f.toLowerCase());
    const statusMatch =
      filters.status.length === 0 || filters.status.some((f) => m.status.toLowerCase() === f.toLowerCase());

    return genreMatch && platformMatch && statusMatch;
  });

  const carouselImages = [
    "https://4kwallpapers.com/images/wallpapers/superman-new-logo-3840x2160-22479.jpg",
    "https://wallpapercave.com/wp/wp5140931.jpg",
    "https://wallpapercat.com/w/full/0/c/f/46439-1920x1080-desktop-1080p-squid-game-background.jpg",
  ];

  return (
    <div style={{ backgroundColor: "rgba(14,14,41,0.91)", width: "100%", paddingBottom: "50px" }}>
      {/* Carousel */}
      <style>
        {`
          .carousel-item {
            transition: transform 3s ease-in-out;
          }
          /* Glass effect */
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .glass-filter {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px;
          }
        `}
      </style>

      <div id="topCarousel" ref={carouselRef} className="carousel slide mb-5">
        <div className="carousel-inner" style={{ height: "700px" }}>
          {carouselImages.map((img, idx) => (
            <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
              <img
                src={img}
                className="d-block w-100 h-100"
                style={{ objectFit: "cover", objectPosition: "top" }}
                alt={`Slide ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="container mb-3 glass-filter">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              list="genre-options"
              placeholder="Filter by Genre"
              className="form-control "
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && genreInput) {
                  handleAddFilter("genre", genreInput.trim());
                  setGenreInput("");
                }
              }}
              value={genreInput}
              style={{ background: "white", color: "black" }}
            />
            <datalist id="genre-options">
              {Array.from(new Set(movies.flatMap((m) => m.genre.split(",")))).map((g) => (
                <option key={g} value={g.trim()} />
              ))}
            </datalist>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-dark"
              onChange={(e) => { if (e.target.value) handleAddFilter("platform", e.target.value); }}
              style={{ background: "transparent", color: "white" }}
            >
              <option value="">Filter by Platform</option>
              <option value="Netflix">Netflix</option>
              <option value="Prime">Prime</option>
              <option value="Disney+">Disney+</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-dark"
              onChange={(e) => { if (e.target.value) handleAddFilter("status", e.target.value); }}
              style={{ background: "transparent", color: "white" }}
            >
              <option value="">Filter by Status</option>
              <option value="Watching">Watching</option>
              <option value="Completed">Completed</option>
              <option value="Wishlist">Wishlist</option>
            </select>
          </div>
        </div>

        {/* Selected Filters */}
        <div className="mt-2">
          {Object.entries(filters).map(([type, values]) =>
            values.map((val) => (
              <button
                key={type + val}
                className="btn btn-outline-light btn-sm me-2 mb-2"
                onClick={() => handleRemoveFilter(type, val)}
              >
                {val} &times;
              </button>
            ))
          )}
        </div>
      </div>

      {/* Movie Grid */}
      <div className="container">
        <div className="row g-4">
          {filteredMovies.length === 0 && (
            <p className="text-center fs-5 text-white">No Movies Found</p>
          )}

          {filteredMovies.map((c, idx) => (
            <div className="col-md-4" key={idx}>
              <div
                className="card h-100 shadow glass-card"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontFamily: "'Oswald', sans-serif",
                }}
              >
                <img
                  src={c.image || `https://placehold.co/400x250?text=${c.title}`}
                  alt={c.title}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                  }}
                />
                <div className="p-3">
                  <h5 style={{ fontWeight: "bold", fontSize: "1.25rem", color: "white" }}>{c.title}</h5>
                  <p className="mb-1" style={{ fontSize: "0.85rem", color: "white" }}>
                    <strong>Genre:</strong> {c.genre} | <strong>Status:</strong> {c.status}
                  </p>
                  {c.status === "Watching" && c.totalEpisodes && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max={c.totalEpisodes}
                        value={c.episodesWatched}
                        onChange={(e) => handleEpisodesChange(idx, e.target.value)}
                        className="form-range"
                        style={{ accentColor: "white" }}
                      />
                      <div className="progress mt-1" style={{ height: "6px" }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${(c.episodesWatched / c.totalEpisodes) * 100}%`,
                            backgroundColor: "white",
                          }}
                        ></div>
                      </div>
                      <p className=" mt-1 mb-0" style={{ fontSize: "0.85rem", color: "white" }}>
                        {c.episodesWatched} / {c.totalEpisodes} Episodes Watched
                      </p>
                    </div>
                  )}

                  <button
                    className="btn btn-dark mt-2 w-100"
                    onClick={() => handleViewMore(c)}
                  >
                    View More
                  </button>
                  <button
                    className="btn mt-2 w-100"
                    onClick={() => handleDeleteMovie(c.id)}
                    style={{ backgroundColor: "#b72121d8", borderColor: "#ff3333", color: "white" }}
                  >
                    Delete Movie
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          setSelectedMovie={setSelectedMovie}
          setMovies={setLocalMovies}
        />
      )}
    </div>
  );
}

export default User;
