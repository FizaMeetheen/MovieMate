import React from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-3"
      style={{
        backgroundColor: "rgba(14, 14, 41, 0.9)",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      
      <h1
        style={{
          fontFamily: "Broadway, sans-serif",
          fontWeight: "bold",
          color: "white",
          fontSize: "2rem",
          margin: 0,
        }}
      >
        MovieMate
      </h1>

      {/* Navbar Buttons */}
      <nav>
        <Link
          to="/movies"
          className="btn mx-2"
          style={{
            backgroundColor: "transparent",
            color: "white",
            fontWeight: "bold",
            border: "none",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#b72121d8")}
          onMouseLeave={(e) => (e.target.style.color = "white")}
        >
          My Movies
        </Link>

        <Link
          to="/admin"
          className="btn mx-2"
          style={{
            backgroundColor: "#b72121d8",
            color: "white",
            fontWeight: "bold",
            borderRadius: "4px",
            padding: "6px 16px",
            transition: "background 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#b72121d8")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#b72121d8")}
        >
          Add Movie
        </Link>
      </nav>
    </header>
  );
}

export default Header;
