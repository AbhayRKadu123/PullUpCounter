import React, { useEffect, useState } from "react";
import "./PullUpCounter.css";

const TARGET = 2000;
const REPS_PER_SET = 5;
const REST_SECONDS = 20;

const TARGET_TIME = 3 * 60 * 60 + 15 * 60; // 3 hours 15 minutes

const PullUpCounter = () => {
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem("pullupCount");
    return savedCount ? Number(savedCount) : 0;
  });

  const [restTime, setRestTime] = useState(() => {
    const savedRest = localStorage.getItem("restTime");
    return savedRest ? Number(savedRest) : 0;
  });

  const [elapsedTime, setElapsedTime] = useState(() => {
    const savedElapsed = localStorage.getItem("elapsedTime");
    return savedElapsed ? Number(savedElapsed) : 0;
  });

  const [isStarted, setIsStarted] = useState(() => {
    return localStorage.getItem("challengeStarted") === "true";
  });

  // Save count
  useEffect(() => {
    localStorage.setItem("pullupCount", count);
  }, [count]);

  // Save rest timer
  useEffect(() => {
    localStorage.setItem("restTime", restTime);
  }, [restTime]);

  // Save elapsed time
  useEffect(() => {
    localStorage.setItem("elapsedTime", elapsedTime);
  }, [elapsedTime]);

  // Save started state
  useEffect(() => {
    localStorage.setItem("challengeStarted", isStarted);
  }, [isStarted]);

  // Rest countdown
  useEffect(() => {
    if (restTime <= 0) return;

    const timer = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restTime]);

  // Challenge elapsed timer
  useEffect(() => {
    if (!isStarted || count >= TARGET) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, count]);

  const addPullups = () => {
    // Don't allow adding during rest
    if (restTime > 0) return;

    // Don't go beyond target
    if (count >= TARGET) return;

    setIsStarted(true);

    setCount((prev) => {
      const newCount = Math.min(
        prev + REPS_PER_SET,
        TARGET
      );

      // Constant 20-second rest
      if (newCount < TARGET) {
        setRestTime(REST_SECONDS);
      }

      return newCount;
    });
  };

  const resetCounter = () => {
    setCount(0);
    setRestTime(0);
    setElapsedTime(0);
    setIsStarted(false);

    localStorage.removeItem("pullupCount");
    localStorage.removeItem("restTime");
    localStorage.removeItem("elapsedTime");
    localStorage.removeItem("challengeStarted");
  };

  const progress = (count / TARGET) * 100;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const remainingReps = TARGET - count;

  const setsCompleted = count / REPS_PER_SET;

  const totalSets = TARGET / REPS_PER_SET;

  const targetRemainingTime = Math.max(
    TARGET_TIME - elapsedTime,
    0
  );

  const timeExpired = elapsedTime >= TARGET_TIME;

  return (
    <div className="counter-container">

      <h1 className="title">
        2000 PULL-UP CHALLENGE
      </h1>

      <div className="counter">
        {count}
      </div>

      <div className="goal">
        / {TARGET} PULL-UPS
      </div>

      <div className="progress-container">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="stats">

        <div>
          <span>SETS</span>

          <strong>
            {setsCompleted} / {totalSets}
          </strong>
        </div>

        <div>
          <span>REMAINING</span>

          <strong>
            {remainingReps}
          </strong>
        </div>

      </div>

      {/* Constant Rest */}
      <div className="timer-section">

        <div className="timer-label">
          {restTime > 0 ? "REST" : "READY"}
        </div>

        <div
          className={`rest-timer ${
            restTime > 0 ? "active" : ""
          }`}
        >
          {restTime > 0 ? `${restTime}s` : "GO"}
        </div>

      </div>

      <button
        className="add-btn"
        onClick={addPullups}
        disabled={restTime > 0 || count >= TARGET}
      >
        {count >= TARGET
          ? "CHALLENGE COMPLETE"
          : restTime > 0
          ? `REST ${restTime}s`
          : "+5 PULL-UPS"}
      </button>

      <div className="time-info">

        <div>
          <span>ELAPSED</span>

          <strong>
            {formatTime(elapsedTime)}
          </strong>
        </div>

        <div>
          <span>3:15 TARGET</span>

          <strong>
            {formatTime(targetRemainingTime)}
          </strong>
        </div>

      </div>

      {/* Time expired */}
      {timeExpired && count < TARGET && (
        <div className="time-expired">
          ⏱️ TARGET TIME REACHED
          <br />
          {count} / {TARGET} COMPLETED
        </div>
      )}

      {/* Complete */}
      {count >= TARGET && (
        <div className="complete">

          🔥 2000 PULL-UPS COMPLETE!

          <br />

          Total Time: {formatTime(elapsedTime)}

          <br />

          {elapsedTime <= TARGET_TIME
            ? "🏆 UNDER 3:15!"
            : "CHALLENGE COMPLETED"}

        </div>
      )}

      <button
        className="reset-btn"
        onClick={resetCounter}
      >
        RESET CHALLENGE
      </button>

    </div>
  );
};

export default PullUpCounter;