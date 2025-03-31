import React, { useState } from "react";
import { Link } from "react-router-dom";
import TensorSpaceVisualizer from "../components/TensorSpaceVisualizer.jsx";
import BeginnersGuide from "../components/BeginnersGuide";
import WhyteChatbot from "../components/WhyteChatbot.jsx"; // Import the chatbot component
import "./LayerVisualizerPage.css";

function LayerVisualizerPage() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="layer-visualizer-container">
      {showGuide && <BeginnersGuide onClose={() => setShowGuide(false)} />}
      <main className="visualizer-content">
        <div className="visualizer-wrapper">
          <TensorSpaceVisualizer />
        </div>
      </main>
      <aside className="chatbot-container">
        <WhyteChatbot /> {/* Add the chatbot component */}
      </aside>
      <Link
        to="/explainable-ai"
        className="explainable-ai-link"
        title="Explore explanation methods for model predictions"
      >
        <div className="explainable-ai-button">
          <span className="button-icon">🔍</span>
          <span className="button-text">Explain Predictions</span>
        </div>
      </Link>
      <footer className="visualizer-footer">
        <p>WhyteBox Neural Network Visualization Tool • Interactive 3D Exploration of MobileNetV1</p>
      </footer>
    </div>
  );
}

export default LayerVisualizerPage;