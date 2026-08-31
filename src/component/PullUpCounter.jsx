import React, { useEffect, useState } from "react";
import "./PullUpCounter.css";

const DEFAULT_SETTINGS = {
  target: 2000,
  repsPerSet: 5,
  targetHours: 3,
  targetMinutes: 15,
  restSeconds: 20,
};

const STORAGE_KEY = "pullupChallenge";

const PullUpCounter = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved).settings,
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }

    return DEFAULT_SETTINGS;
  });

  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved).count || 0;
      } catch {
        return 0;
      }
    }

    return 0;
  });

  const [elapsedTime, setElapsedTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved).elapsedTime || 0;
      } catch {
        return 0;
      }
    }

    return 0;
  });

  const [restTime, setRestTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved).restTime || 0;
      } catch {
        return 0;
      }
    }

    return 0;
  });

  const [isStarted, setIsStarted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved).isStarted || false;
      } catch {
        return false;
      }
    }

    return false;
  });

  const [isPaused, setIsPaused] = useState(false);

  const [showSettings, setShowSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return true;

    try {
      return !JSON.parse(saved).isStarted;
    } catch {
      return true;
    }
  });

  // ---------------------------------------
  // Calculations
  // ---------------------------------------

  const TARGET_TIME =
    settings.targetHours * 60 * 60 +
    settings.targetMinutes * 60;

  const remainingReps = Math.max(settings.target - count, 0);

  const setsCompleted = Math.floor(count / settings.repsPerSet);

  const totalSets = Math.ceil(
    settings.target / settings.repsPerSet
  );

  const progress =
    settings.target > 0
      ? Math.min((count / settings.target) * 100, 100)
      : 0;

  const targetRemainingTime = Math.max(
    TARGET_TIME - elapsedTime,
    0
  );

  const timeExpired =
    elapsedTime >= TARGET_TIME &&
    count < settings.target;

  const isComplete = count >= settings.target;

  // ---------------------------------------
  // Save everything
  // ---------------------------------------

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        settings,
        count,
        elapsedTime,
        restTime,
        isStarted,
      })
    );
  }, [
    settings,
    count,
    elapsedTime,
    restTime,
    isStarted,
  ]);

  // ---------------------------------------
  // Main elapsed timer
  // ---------------------------------------

  useEffect(() => {
    if (
      !isStarted ||
      isPaused ||
      isComplete ||
      timeExpired
    ) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isStarted,
    isPaused,
    isComplete,
    timeExpired,
  ]);

  // ---------------------------------------
  // Rest countdown
  // ---------------------------------------

  useEffect(() => {
    if (restTime <= 0 || isPaused) return;

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
  }, [restTime, isPaused]);

  // ---------------------------------------
  // Format time
  // ---------------------------------------

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);

    const mins = Math.floor(
      (seconds % 3600) / 60
    );

    const secs = seconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ---------------------------------------
  // Start challenge
  // ---------------------------------------

  const startChallenge = () => {
    if (settings.target <= 0) return;
    if (settings.repsPerSet <= 0) return;

    setIsStarted(true);
    setIsPaused(false);
    setShowSettings(false);
  };

  // ---------------------------------------
  // Add reps
  // ---------------------------------------
const addPullups = () => {
  if (!isStarted) return;
  if (isPaused) return;
  if (restTime > 0) return;
  if (count >= settings.target) return;

  const remaining = settings.target - count;

  const repsToAdd = Math.min(
    settings.repsPerSet,
    remaining
  );

  const newCount = count + repsToAdd;

  setCount(newCount);

  if (
    newCount < settings.target &&
    settings.restSeconds > 0
  ) {
    setRestTime(settings.restSeconds);
  }
};

  // ---------------------------------------
  // Pause / Resume
  // ---------------------------------------

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // ---------------------------------------
  // Reset
  // ---------------------------------------

  const resetCounter = () => {
    const confirmed = window.confirm(
      "Reset this challenge? All progress will be lost."
    );

    if (!confirmed) return;

    setCount(0);
    setElapsedTime(0);
    setRestTime(0);
    setIsStarted(false);
    setIsPaused(false);
    setShowSettings(true);

    localStorage.removeItem(STORAGE_KEY);
  };

  // ---------------------------------------
  // Update setting
  // ---------------------------------------

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  // ---------------------------------------
  // Presets
  // ---------------------------------------

  const applyPreset = (
    target,
    repsPerSet,
    hours,
    minutes,
    rest
  ) => {
    setSettings({
      target,
      repsPerSet,
      targetHours: hours,
      targetMinutes: minutes,
      restSeconds: rest,
    });
  };

  // ---------------------------------------
  // Change settings before challenge
  // ---------------------------------------

  const editSettings = () => {
    if (isStarted) {
      const confirmed = window.confirm(
        "Changing settings will reset the current challenge. Continue?"
      );

      if (!confirmed) return;

      setCount(0);
      setElapsedTime(0);
      setRestTime(0);
      setIsStarted(false);
      setIsPaused(false);
    }

    setShowSettings(true);
  };

  return (
    <div className="counter-container">

      {/* =====================================
          SETTINGS
      ====================================== */}

      {showSettings && (
        <div className="settings-panel">

          <h1 className="title">
            PULL-UP CHALLENGE
          </h1>

          <p className="settings-subtitle">
            Configure your challenge
          </p>

          {/* Target */}

          <div className="setting-group">

            <label>
              🎯 TARGET PULL-UPS
            </label>

            <input
              type="number"
              min="1"
              value={settings.target}
              onChange={(e) =>
                updateSetting(
                  "target",
                  e.target.value
                )
              }
            />

          </div>

          {/* Reps */}

          <div className="setting-group">

            <label>
              💪 REPS PER SET
            </label>

            <input
              type="number"
              min="1"
              value={settings.repsPerSet}
              onChange={(e) =>
                updateSetting(
                  "repsPerSet",
                  e.target.value
                )
              }
            />

          </div>

          {/* Target Time */}

          <div className="setting-group">

            <label>
              ⏱️ TARGET TIME
            </label>

            <div className="time-inputs">

              <div>
                <input
                  type="number"
                  min="0"
                  value={settings.targetHours}
                  onChange={(e) =>
                    updateSetting(
                      "targetHours",
                      e.target.value
                    )
                  }
                />

                <span>Hours</span>
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={settings.targetMinutes}
                  onChange={(e) =>
                    updateSetting(
                      "targetMinutes",
                      e.target.value
                    )
                  }
                />

                <span>Minutes</span>
              </div>

            </div>

          </div>

          {/* Rest */}

          <div className="setting-group">

            <label>
              🛌 REST BETWEEN SETS
            </label>

            <div className="rest-input">

              <input
                type="number"
                min="0"
                max="300"
                value={settings.restSeconds}
                onChange={(e) =>
                  updateSetting(
                    "restSeconds",
                    e.target.value
                  )
                }
              />

              <span>seconds</span>

            </div>

          </div>

          {/* Presets */}

          <div className="preset-section">

            <label>QUICK PRESETS</label>

            <div className="presets">

              <button
                onClick={() =>
                  applyPreset(
                    500,
                    5,
                    1,
                    0,
                    20
                  )
                }
              >
                500
              </button>

              <button
                onClick={() =>
                  applyPreset(
                    1000,
                    5,
                    2,
                    0,
                    20
                  )
                }
              >
                1000
              </button>

              <button
                onClick={() =>
                  applyPreset(
                    2000,
                    5,
                    3,
                    15,
                    20
                  )
                }
              >
                2000
              </button>

              <button
                onClick={() =>
                  applyPreset(
                    2500,
                    5,
                    4,
                    0,
                    20
                  )
                }
              >
                2500
              </button>

            </div>

          </div>

          {/* Preview */}

          <div className="challenge-preview">

            <span>CHALLENGE</span>

            <strong>
              {settings.target} PULL-UPS
            </strong>

            <small>
              {settings.repsPerSet} reps/set •{" "}
              {settings.restSeconds}s rest •{" "}
              {settings.targetHours}h{" "}
              {settings.targetMinutes}m target
            </small>

          </div>

          <button
            className="start-btn"
            onClick={startChallenge}
          >
            START CHALLENGE
          </button>

        </div>
      )}

      {/* =====================================
          CHALLENGE
      ====================================== */}

      {!showSettings && (
        <>
          <div className="challenge-header">

            <div>
              <h1 className="title">
                {settings.target} PULL-UP
                CHALLENGE
              </h1>

              <div className="challenge-config">
                {settings.repsPerSet} reps/set
                <span>•</span>
                {settings.restSeconds}s rest
              </div>
            </div>

            <button
              className="settings-btn"
              onClick={editSettings}
            >
              ⚙️
            </button>

          </div>

          {/* Counter */}

          <div className="counter">
            {count}
          </div>

          <div className="goal">
            / {settings.target} PULL-UPS
          </div>

          {/* Progress */}

          <div className="progress-container">

            <div
              className="progress"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="progress-percent">
            {progress.toFixed(1)}%
          </div>

          {/* Stats */}

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

          {/* Rest */}

          <div className="timer-section">

            <div className="timer-label">
              {restTime > 0
                ? "REST"
                : isPaused
                ? "PAUSED"
                : "READY"}
            </div>

            <div
              className={`rest-timer ${
                restTime > 0 ? "active" : ""
              }`}
            >
              {restTime > 0
                ? `${restTime}s`
                : isPaused
                ? "⏸"
                : "GO"}
            </div>

          </div>

          {/* Main Button */}

          <button
            className="add-btn"
            onClick={addPullups}
            disabled={
              restTime > 0 ||
              isPaused ||
              isComplete ||
              timeExpired
            }
          >
            {isComplete
              ? "🏆 COMPLETE"
              : restTime > 0
              ? `REST ${restTime}s`
              : isPaused
              ? "PAUSED"
              : `+${Math.min(
                  settings.repsPerSet,
                  remainingReps
                )} PULL-UPS`}
          </button>

          {/* Pause */}

          {!isComplete && !timeExpired && (
            <button
              className="pause-btn"
              onClick={togglePause}
            >
              {isPaused
                ? "▶ RESUME"
                : "⏸ PAUSE"}
            </button>
          )}

          {/* Time */}

          <div className="time-info">

            <div>
              <span>ELAPSED</span>

              <strong>
                {formatTime(elapsedTime)}
              </strong>
            </div>

            <div>
              <span>TIME REMAINING</span>

              <strong>
                {formatTime(targetRemainingTime)}
              </strong>
            </div>

          </div>

          {/* Target info */}

          <div className="pace-info">

            <div>
              <span>TARGET</span>

              <strong>
                {formatTime(TARGET_TIME)}
              </strong>
            </div>

            <div>
              <span>AVG / SET</span>

              <strong>
                {count > 0
                  ? (
                      elapsedTime /
                      Math.max(setsCompleted, 1)
                    ).toFixed(1)
                  : "0"}{" "}
                sec
              </strong>
            </div>

          </div>

          {/* Time expired */}

          {timeExpired && !isComplete && (
            <div className="time-expired">

              ⏱️ TARGET TIME REACHED

              <br />

              {count} / {settings.target} COMPLETED

              <br />

              <small>
                You can continue if you want.
              </small>

            </div>
          )}

          {/* Complete */}

          {isComplete && (
            <div className="complete">

              🔥 {settings.target} PULL-UPS
              COMPLETE!

              <br />

              Total Time:{" "}
              {formatTime(elapsedTime)}

              <br />

              {elapsedTime <= TARGET_TIME
                ? `🏆 BEAT ${formatTime(
                    TARGET_TIME
                  )}!`
                : "CHALLENGE COMPLETED"}

            </div>
          )}

          {/* Reset */}

          <button
            className="reset-btn"
            onClick={resetCounter}
          >
            RESET CHALLENGE
          </button>

        </>
      )}

    </div>
  );
};

export default PullUpCounter;