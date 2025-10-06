import React from "react";
import Navbar from "../components/home/navbar";
import Hero from "../components/home/hero";
import Stats from "../components/home/stats";
import HowItWorks from "../components/home/howitworks";
import CTA from "../components/home/cta";
import Footer from "../components/home/footer";
import "../styles/home.css"
import WhatWeShare from "../components/home/whatweshare";

const HomePage: React.FC = () => (
  <>
    <Navbar />
    <Hero />
    <Stats />
    <WhatWeShare/>
    <HowItWorks />
    <CTA />
    <Footer />
  </>
);

export default HomePage;
