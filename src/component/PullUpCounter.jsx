import React, { useEffect, useState } from "react";
import "./PullUpCounter.css"

const PullUpCounter = () => {
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem("pullupCount");
    return savedCount ? Number(savedCount) : 0;
  });

  useEffect(() => {
    localStorage.setItem("pullupCount", count);
  }, [count]);

  const addPullups = () => {
    setCount((prev) => Math.min(prev + 10, 1000));
  };

  const resetCounter = () => {
    setCount(0);
  };

  const progress = (count / 1000) * 100;

  return (
    <div className="counter-container">
      <h1 className="title">PULL-UP CHALLENGE</h1>

      <div className="counter">
        {count}
      </div>

      <div className="goal">
        / 1000 PULL-UPS
      </div>

      <div className="progress-container">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button className="add-btn" onClick={addPullups}>
        +10 PULL-UPS
      </button>

      <button className="reset-btn" onClick={resetCounter}>
        RESET
      </button>
    </div>
  );
};

export default PullUpCounter;