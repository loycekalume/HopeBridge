import React from "react";

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-content">
        <div className="footer-col footer-col-main">
          <div className="footer-logo">
            <i className="fas fa-heart"></i>
            <span>HopeBridge</span>
          </div>
          <p className="footer-description">
            Bridging resources. Building hope. Connecting communities to share and receive essential support.
          </p>
          <div className="footer-contact">
            <p><i className="fas fa-envelope"></i> contact@hopebridge.org</p>
            <p><i className="fas fa-phone"></i> +254 757-123-456</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Hope Street, Community City</p>
          </div>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home"><i className="fas fa-chevron-right"></i> Home</a></li>
            <li><a href="#how-it-works"><i className="fas fa-chevron-right"></i> How It Works</a></li>
            <li><a href="#about"><i className="fas fa-chevron-right"></i> About Us</a></li>
            <li><a href="#donor"><i className="fas fa-chevron-right"></i> Donor Portal</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4 className="footer-heading">Get Involved</h4>
          <ul className="footer-links">
            <li><a href="#donate"><i className="fas fa-chevron-right"></i> Donate Resources</a></li>
            <li><a href="#request"><i className="fas fa-chevron-right"></i> Request Help</a></li>
            <li><a href="#partner"><i className="fas fa-chevron-right"></i> Partner with Us</a></li>
            <li><a href="#volunteer"><i className="fas fa-chevron-right"></i> Volunteer</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2025 HopeBridge. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <span className="separator">•</span>
          <a href="#terms">Terms of Service</a>
          <span className="separator">•</span>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
