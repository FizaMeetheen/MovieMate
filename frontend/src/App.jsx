import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Admin from "./Pages/Admin";
import User from "./Pages/User";
import Header from "./Components/Header";
import "./App.css"; 

function App() {
  const [movies, setMovies] = useState([]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/admin" element={<Admin setMovies={setMovies} />} />
          <Route path="/movies" element={<User setMovies={setMovies} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
