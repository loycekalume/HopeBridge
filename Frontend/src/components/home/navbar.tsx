import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="logo">
            <i className="fas fa-heart"></i>
            <span>HopeBridge</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>
          <div className="nav-actions">
            <a  className="nav-link"><Link to="/login">Login</Link></a>
            <button className="btn btn-primary"><Link to="/signup">Sign Up</Link></button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
