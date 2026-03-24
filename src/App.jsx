import { useEffect, useMemo, useState } from "react";

const BRAND = {
  navy: "#2f3952",
  green: "#6fa58e",
  paleGreen: "#eaf4ef",
  paleBlue: "#eef3f8",
  mist: "#f6f8fb",
  softText: "#94a3b8",
  warm: "#f5f7fa",
  line: "#d9e2ea",
  white: "#ffffff",
};

export default function App() {
  const starterPlan = [
    {
      day: 1,
      title: "Garden Strength Circuit A",
      focus: "Legs, core, cardio",
      exercises: [
        { name: "Squats", target: "15–20 reps", notes: "Slow and controlled" },
        { name: "Split squats", target: "10 each leg", notes: "Use balance support if needed" },
        { name: "Glute bridges", target: "15–20 reps", notes: "Pause at the top" },
        { name: "Fast march / high knees", target: "30–40 sec", notes: "Choose wrist-friendly cardio" },
        { name: "Dead bugs or elbow plank", target: "10 each side / 20–40 sec", notes: "Avoid pressure through hands" },
        { name: "Invisible band pull-aparts", target: "15 reps", notes: "Posture and upper back" },
      ],
    },
    {
      day: 2,
      title: "Recovery + Movement",
      focus: "Mobility and light cardio",
      exercises: [
        { name: "Brisk walk / garden laps", target: "10–20 mins", notes: "Keep it easy" },
        { name: "Slow squats", target: "10 reps", notes: "Loosen legs" },
        { name: "Hip mobility", target: "2 mins", notes: "Circles and openers" },
        { name: "Torso twists", target: "1 min", notes: "Gentle" },
        { name: "March on spot", target: "2 mins", notes: "Steady" },
      ],
    },
    {
      day: 3,
      title: "Garden Strength Circuit B",
      focus: "Balance, stamina, core",
      exercises: [
        { name: "Tempo squats", target: "12–15 reps", notes: "3 seconds down" },
        { name: "Reverse lunges", target: "8–10 each leg", notes: "Controlled" },
        { name: "Single-leg glute bridge", target: "8 each leg", notes: "Only if comfortable" },
        { name: "Side steps", target: "40 sec", notes: "Light and quick" },
        { name: "Dead bugs", target: "10 each side", notes: "Slow quality reps" },
        { name: "Standing reach + brace", target: "10 reps", notes: "Core control" },
      ],
    },
  ];

  const loadState = () => {
    try {
      const saved = localStorage.getItem("garden-workout-tracker-v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const [history, setHistory] = useState([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [rounds, setRounds] = useState("3");
  const [effort, setEffort] = useState("good");
  const [energy, setEnergy] = useState(3);
  const [wrist, setWrist] = useState(2);
  const [notes, setNotes] = useState("");
  const [kidsJoined, setKidsJoined] = useState(false);
  const [todayKey, setTodayKey] = useState("");

  const [workoutMode, setWorkoutMode] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [phase, setPhase] = useState("work");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setHistory(saved.history || []);
      setSessionIndex(saved.sessionIndex || 0);
    }
    setTodayKey(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "garden-workout-tracker-v1",
      JSON.stringify({ history, sessionIndex })
    );
  }, [history, sessionIndex]);

  const baseSession = starterPlan[sessionIndex % starterPlan.length];
  const cycleNumber = Math.floor(sessionIndex / starterPlan.length) + 1;

  function bumpReps(target) {
    const map = {
      "15–20 reps": "18–22 reps",
      "10 each leg": "12 each leg",
      "15 reps": "18 reps",
      "12–15 reps": "14–16 reps",
      "8–10 each leg": "10 each leg",
      "8 each leg": "10 each leg",
      "10 reps": "12 reps",
    };
    return map[target] || target;
  }

  const adaptedSession = useMemo(() => {
    const previous = history[0];
    let title = `${baseSession.title} · Cycle ${cycleNumber}`;
    let coachNote = "A solid default session. Keep it smooth, not heroic.";
    let roundGuide = "Aim for 3 rounds today.";
    let focusLine = "Steady strength with wrist-friendly movement.";
    let exerciseAdjustments = baseSession.exercises.map((e) => ({ ...e }));

    if (previous) {
      if (previous.effort === "good") {
        coachNote = "Nice work last time. Nudge things forward a touch today.";
        roundGuide = "Aim for 3–4 rounds today depending on time and energy.";
        focusLine = "A slightly progressive session to build momentum.";
        exerciseAdjustments = exerciseAdjustments.map((e, i) =>
          i < 3 ? { ...e, target: bumpReps(e.target) } : e
        );
      }
      if (previous.effort === "hard") {
        coachNote = "Last session sounded like enough. Today is about quality, not chasing volume.";
        roundGuide = "Aim for 2–3 rounds today.";
        focusLine = "Keep the movement clean and leave a bit in the tank.";
      }
      if (previous.wrist >= 4) {
        title += " · Wrist Friendly";
        coachNote = "Your last check-in suggested the wrist was grumpy. Keep all loading off the hands today.";
        focusLine = "Protect the wrist and keep the rest of the body moving.";
        exerciseAdjustments = exerciseAdjustments.map((e) =>
          e.name.toLowerCase().includes("plank")
            ? { ...e, name: "Dead bugs", target: "10 each side", notes: "Swap plank out to protect wrist" }
            : e
        );
      }
      if (previous.energy <= 2) {
        coachNote += " Energy looked a bit low, so an 80% session is a win.";
      }
    }

    return {
      ...baseSession,
      title,
      coachNote,
      roundGuide,
      focusLine,
      exercises: exerciseAdjustments,
    };
  }, [baseSession, cycleNumber, history]);

  useEffect(() => {
    if (!workoutMode || !timerRunning) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === "work") {
          setPhase("rest");
          return 20;
        } else {
          const nextIndex = currentExerciseIndex + 1;
          if (nextIndex < adaptedSession.exercises.length) {
            setCurrentExerciseIndex(nextIndex);
            setPhase("work");
            return 40;
          } else {
            setTimerRunning(false);
            return 0;
          }
        }
      });
    }, 1000);

    return () => clearInterval(id);
  }, [workoutMode, timerRunning, phase, currentExerciseIndex, adaptedSession.exercises.length]);

  function completeSession() {
    const entry = {
      date: new Date().toLocaleDateString(),
      sessionNumber: sessionIndex + 1,
      sessionTitle: adaptedSession.title,
      rounds,
      effort,
      energy,
      wrist,
      notes,
      kidsJoined,
    };
    setHistory((prev) => [entry, ...prev]);
    setSessionIndex((prev) => prev + 1);
    setRounds("3");
    setEffort("good");
    setEnergy(3);
    setWrist(2);
    setNotes("");
    setKidsJoined(false);
    stopWorkoutMode();
  }

  function resetAll() {
    setHistory([]);
    setSessionIndex(0);
    setRounds("3");
    setEffort("good");
    setEnergy(3);
    setWrist(2);
    setNotes("");
    setKidsJoined(false);
    localStorage.removeItem("garden-workout-tracker-v1");
    stopWorkoutMode();
  }

  const currentChallenge = useMemo(() => {
    const challenges = [
      "Let one of the kids be your coach for one round.",
      "Do every squat with a 2-second pause at the bottom.",
      "Add one extra minute of brisk marching at the end.",
      "Do the whole session with perfect posture focus.",
      "Let the kids count all your reps out loud.",
      "Add 5 bonus glute bridges after each round.",
      "Finish with 30 seconds of side steps with a smile.",
      "Do one round extra slowly and cleanly.",
    ];

    if (!todayKey) return challenges[0];

    const seed = todayKey
      .split("-")
      .join("")
      .split("")
      .reduce((sum, n) => sum + Number(n), 0);

    return challenges[seed % challenges.length];
  }, [todayKey]);

  const streakCount = useMemo(() => {
    if (history.length === 0) return 0;

    const uniqueDates = [
      ...new Set(
        history.map((item) => {
          const parts = item.date.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
          return item.date;
        })
      ),
    ].sort().reverse();

    let streak = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(current);
      expected.setDate(current.getDate() - i);
      const expectedKey = expected.toISOString().slice(0, 10);

      if (uniqueDates[i] === expectedKey) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }, [history]);

  const shareText = useMemo(() => {
    const latest = history[0];
    if (!latest) return "No sessions logged yet.";
    return `Latest workout update:
Session: ${latest.sessionTitle}
Date: ${latest.date}
Rounds: ${latest.rounds}
Effort: ${latest.effort}
Energy: ${latest.energy}/5
Wrist: ${latest.wrist}/5
Kids joined: ${latest.kidsJoined ? "Yes" : "No"}
Challenge of the day: ${currentChallenge}
Current streak: ${streakCount} day${streakCount === 1 ? "" : "s"}
Notes: ${latest.notes || "None"}`;
  }, [history, currentChallenge, streakCount]);

  function startWorkoutMode() {
    setWorkoutMode(true);
    setCurrentExerciseIndex(0);
    setPhase("work");
    setTimeLeft(40);
    setTimerRunning(false);
  }

  function stopWorkoutMode() {
    setWorkoutMode(false);
    setCurrentExerciseIndex(0);
    setPhase("work");
    setTimeLeft(40);
    setTimerRunning(false);
  }

  function toggleTimer() {
    setTimerRunning((prev) => !prev);
  }

  function nextExercise() {
    if (currentExerciseIndex < adaptedSession.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setPhase("work");
      setTimeLeft(40);
      setTimerRunning(false);
    }
  }

  function prevExercise() {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setPhase("work");
      setTimeLeft(40);
      setTimerRunning(false);
    }
  }

  const currentExercise = adaptedSession.exercises[currentExerciseIndex];
  const progressPercent = ((currentExerciseIndex + 1) / adaptedSession.exercises.length) * 100;

  return (
    <div style={pageStyle}>
      <style>{`
        body {
          margin: 0;
          font-family: Inter, Manrope, "Segoe UI", Arial, sans-serif;
          background: ${BRAND.mist};
        }
        * {
          box-sizing: border-box;
          min-width: 0;
        }
        @media (max-width: 900px) {
          .fal-hero {
            grid-template-columns: 1fr !important;
          }
          .fal-main {
            grid-template-columns: 1fr !important;
          }
          .fal-workout-top {
            grid-template-columns: 1fr !important;
          }
          .fal-log-grid {
            grid-template-columns: 1fr !important;
          }
          .fal-brand-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .fal-header-actions {
            width: 100%;
          }
          .fal-header-actions button {
            width: 100%;
          }
          .fal-hero-meta {
            grid-template-columns: 1fr !important;
          }
          .fal-exercise-card {
            grid-template-columns: 42px 1fr !important;
          }
          .fal-exercise-pill {
            grid-column: 2 / 3 !important;
            justify-self: start !important;
            margin-top: 10px !important;
            white-space: normal !important;
          }
          .fal-glance-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .fal-glance-value {
            text-align: left !important;
          }
        }
      `}</style>

      <div style={glowLeft} />
      <div style={glowRight} />

      <div style={containerStyle}>
        <div className="fal-hero" style={heroGrid}>
          <div style={heroMainCard}>
            <BrandLogo />
            <div style={{ marginTop: "18px" }}>
              <div style={eyebrowStyle}>Today’s focus</div>
              <h1 style={heroTitle}>{adaptedSession.focusLine}</h1>
              <p style={heroSub}>
                Adaptive workouts built around your space, your time, your energy and real life.
              </p>
            </div>

            <div className="fal-hero-meta" style={heroMetaRow}>
              <div style={miniMetaCard}>
                <div style={miniMetaLabel}>Current session</div>
                <div style={miniMetaValue}>{adaptedSession.title}</div>
              </div>
              <div style={miniMetaCard}>
                <div style={miniMetaLabel}>Suggested volume</div>
                <div style={miniMetaValue}>{adaptedSession.roundGuide}</div>
              </div>
            </div>
          </div>

          <div style={heroSideCard}>
            <div style={heroSideTop}>Ready when you are</div>
            <div style={heroSideText}>
              Start guided mode for a cleaner, one-step-at-a-time workout flow.
            </div>
            <div className="fal-header-actions" style={{ marginTop: "18px" }}>
              {!workoutMode ? (
                <button onClick={startWorkoutMode} style={bigPrimaryButton}>
                  Start Workout Mode
                </button>
              ) : (
                <button onClick={stopWorkoutMode} style={bigSecondaryButton}>
                  Exit Workout Mode
                </button>
              )}
            </div>
          </div>
        </div>

        {workoutMode && (
          <div style={workoutModeCard}>
            <div style={progressBarOuter}>
              <div style={{ ...progressBarInner, width: `${progressPercent}%` }} />
            </div>

            <div className="fal-workout-top" style={workoutModeTop}>
              <div style={workoutContentCard}>
                <div style={phaseBadge(phase)}>{phase === "work" ? "Work" : "Rest"}</div>
                <h2 style={{ margin: "16px 0 8px 0", fontSize: "30px", color: BRAND.navy }}>
                  {currentExercise ? currentExercise.name : "Workout complete"}
                </h2>
                <p style={{ margin: 0, color: BRAND.softText, fontSize: "16px", lineHeight: 1.6 }}>
                  {currentExercise ? currentExercise.notes : "Nicely done."}
                </p>

                {currentExercise && (
                  <div style={{ marginTop: "18px" }}>
                    <div style={targetPill}>{currentExercise.target}</div>
                    <div style={{ marginTop: "10px", color: BRAND.softText }}>
                      Exercise {currentExerciseIndex + 1} of {adaptedSession.exercises.length}
                    </div>
                  </div>
                )}
              </div>

              <div style={timerWrapCard}>
                <div style={timerCircle}>
                  <div style={{ fontSize: "14px", color: BRAND.softText }}>Timer</div>
                  <div style={{ fontSize: "46px", fontWeight: 800, color: BRAND.navy }}>{timeLeft}s</div>
                </div>
              </div>
            </div>

            <div style={workoutControls}>
              <button onClick={prevExercise} style={secondaryButton} disabled={currentExerciseIndex === 0}>
                Back
              </button>
              <button onClick={toggleTimer} style={primaryButton}>
                {timerRunning ? "Pause" : "Start Timer"}
              </button>
              <button
                onClick={nextExercise}
                style={secondaryButton}
                disabled={currentExerciseIndex === adaptedSession.exercises.length - 1}
              >
                Next
              </button>
            </div>

            <div style={finishRow}>
              <button onClick={completeSession} style={bigPrimaryButton}>
                Finish & Log Session
              </button>
            </div>
          </div>
        )}

        <div className="fal-main" style={mainGrid}>
          <div style={{ display: "grid", gap: "20px" }}>
            <div style={cardStyle}>
              <div style={sectionLabel}>Coach guidance</div>
              <div style={coachNoteBox}>
                <strong>Coach note:</strong> {adaptedSession.coachNote}
              </div>
            </div>

            <div style={cardStyle}>
              <div className="fal-brand-row" style={sectionHeaderRow}>
                <div>
                  <div style={sectionLabel}>Today’s plan</div>
                  <h2 style={sectionTitle}>Today’s session</h2>
                </div>
                <div style={sectionHelper}>{adaptedSession.exercises.length} exercises</div>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                {adaptedSession.exercises.map((exercise, idx) => (
                  <div key={idx} className="fal-exercise-card" style={exerciseCard}>
                    <div style={exerciseNumber}>{idx + 1}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "18px", color: BRAND.navy }}>
                        {exercise.name}
                      </div>
                      <div style={{ color: BRAND.softText, marginTop: "4px", lineHeight: 1.5 }}>
                        {exercise.notes}
                      </div>
                    </div>
                    <div className="fal-exercise-pill" style={smallTargetPill}>{exercise.target}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <div className="fal-brand-row" style={sectionHeaderRow}>
                <div>
                  <div style={sectionLabel}>Session log</div>
                  <h2 style={sectionTitle}>Log this session</h2>
                </div>
              </div>

              <div className="fal-log-grid" style={logGrid}>
                <label>
                  <div style={labelStyle}>Rounds completed</div>
                  <input value={rounds} onChange={(e) => setRounds(e.target.value)} style={inputStyle} />
                </label>

                <label>
                  <div style={labelStyle}>Overall effort</div>
                  <select value={effort} onChange={(e) => setEffort(e.target.value)} style={inputStyle}>
                    <option value="easy">Easy</option>
                    <option value="good">Good</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>

                <label>
                  <div style={labelStyle}>Energy (1 low – 5 high)</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ color: BRAND.softText, marginTop: "6px" }}>{energy}/5</div>
                </label>

                <label>
                  <div style={labelStyle}>Wrist discomfort (1 fine – 5 bad)</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={wrist}
                    onChange={(e) => setWrist(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                  <div style={{ color: BRAND.softText, marginTop: "6px" }}>{wrist}/5</div>
                </label>
              </div>

              <label style={{ display: "block", marginTop: "18px" }}>
                <div style={labelStyle}>Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Anything worth noting? Kids joined in, felt tired, left knee tight..."
                  style={{ ...inputStyle, resize: "vertical", minHeight: "110px" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", color: BRAND.navy }}>
                <input type="checkbox" checked={kidsJoined} onChange={(e) => setKidsJoined(e.target.checked)} />
                <span>The kids joined in today</span>
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "22px" }}>
                <button onClick={completeSession} style={primaryButton}>
                  Complete session and move to next
                </button>
                <button onClick={() => navigator.clipboard.writeText(shareText)} style={secondaryButton}>
                  Copy summary for ChatGPT
                </button>
                <button onClick={resetAll} style={ghostButton}>
                  Reset plan
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            <div style={streakCard}>
              <div style={sectionLabelLight}>Momentum</div>
              <h2 style={{ marginTop: "6px", marginBottom: "10px" }}>Streak counter</h2>
              <div style={{ fontSize: "52px", fontWeight: 800, lineHeight: 1 }}>
                {streakCount}
              </div>
              <p style={{ color: "#d6e5dd", marginTop: "10px", marginBottom: 0 }}>
                day{streakCount === 1 ? "" : "s"} in a row
              </p>
            </div>

            <div style={warmCardStyle}>
              <div style={sectionLabel}>Today’s extra twist</div>
              <h2 style={{ marginTop: "6px", color: BRAND.navy, marginBottom: "10px" }}>
                Challenge of the day
              </h2>
              <div style={{ color: BRAND.navy, lineHeight: 1.6 }}>{currentChallenge}</div>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>Snapshot</div>
              <h2 style={sectionTitle}>Today at a glance</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                <div className="fal-glance-row" style={glanceRow}>
                  <span style={glanceKey}>Session</span>
                  <span className="fal-glance-value" style={glanceValue}>{adaptedSession.title}</span>
                </div>
                <div className="fal-glance-row" style={glanceRow}>
                  <span style={glanceKey}>Focus</span>
                  <span className="fal-glance-value" style={glanceValue}>{adaptedSession.focus}</span>
                </div>
                <div className="fal-glance-row" style={glanceRow}>
                  <span style={glanceKey}>Suggested rounds</span>
                  <span className="fal-glance-value" style={glanceValue}>{adaptedSession.roundGuide}</span>
                </div>
                <div className="fal-glance-row" style={glanceRow}>
                  <span style={glanceKey}>Exercises</span>
                  <span className="fal-glance-value" style={glanceValue}>{adaptedSession.exercises.length}</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>How it works</div>
              <h2 style={sectionTitle}>How this works</h2>
              <ol style={{ paddingLeft: "20px", color: BRAND.navy, lineHeight: 1.8, marginBottom: 0 }}>
                <li>Do the suggested garden session.</li>
                <li>Log how it went at the end.</li>
                <li>The next session adjusts based on effort, energy and wrist score.</li>
                <li>Copy the summary and paste it into ChatGPT if you want to refine it further.</li>
              </ol>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>Progress</div>
              <h2 style={sectionTitle}>Session history</h2>
              {history.length === 0 ? (
                <div style={{ color: BRAND.softText }}>No sessions logged yet.</div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {history.map((item, idx) => (
                    <div key={idx} style={historyCard}>
                      <div style={{ fontWeight: 700, color: BRAND.navy }}>{item.sessionTitle}</div>
                      <div style={{ color: BRAND.softText, fontSize: "14px", marginTop: "4px" }}>{item.date}</div>
                      <div style={{ marginTop: "8px", color: BRAND.navy }}>
                        Rounds: {item.rounds} · Effort: {item.effort}
                      </div>
                      <div style={{ color: BRAND.navy }}>
                        Energy: {item.energy}/5 · Wrist: {item.wrist}/5
                      </div>
                      <div style={{ color: BRAND.navy }}>
                        Kids joined: {item.kidsJoined ? "Yes" : "No"}
                      </div>
                      {item.notes && <div style={{ marginTop: "8px", color: BRAND.softText }}>“{item.notes}”</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={brandInfoCard}>
              <div style={sectionLabelLight}>Built for real life</div>
              <h2 style={{ marginTop: "6px" }}>Built around your real constraints</h2>
              <p>• Small garden</p>
              <p>• No equipment</p>
              <p>• Wrist-friendly choices</p>
              <p>• Kid-compatible sessions</p>
              <p>• Flexible enough for holidays and family time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <div>
      <div className="fal-brand-row" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <svg viewBox="0 0 90 90" width="72" height="72" aria-hidden="true">
          <circle
            cx="45"
            cy="45"
            r="28"
            fill="none"
            stroke={BRAND.navy}
            strokeWidth="8"
            strokeDasharray="120 60"
            strokeLinecap="butt"
            transform="rotate(135 45 45)"
          />
          <circle
            cx="45"
            cy="45"
            r="28"
            fill="none"
            stroke={BRAND.green}
            strokeWidth="8"
            strokeDasharray="90 90"
            strokeLinecap="butt"
            transform="rotate(-45 45 45)"
          />
        </svg>

        <div>
          <div style={{ fontSize: "44px", fontWeight: 700, lineHeight: 1, letterSpacing: "0.02em" }}>
            <span style={{ color: BRAND.navy }}>Fit </span>
            <span style={{ color: BRAND.green }}>Around </span>
            <span style={{ color: BRAND.navy }}>Life</span>
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "16px",
              color: BRAND.softText,
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            Your space. Your time. Your workout.
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: `linear-gradient(180deg, ${BRAND.mist} 0%, ${BRAND.paleBlue} 50%, ${BRAND.warm} 100%)`,
  padding: "24px",
  color: BRAND.navy,
  position: "relative",
  overflow: "hidden",
};

const glowLeft = {
  position: "absolute",
  top: "-120px",
  left: "-80px",
  width: "320px",
  height: "320px",
  background: "radial-gradient(circle, rgba(111,165,142,0.22), transparent 70%)",
  pointerEvents: "none",
};

const glowRight = {
  position: "absolute",
  top: "-80px",
  right: "-60px",
  width: "320px",
  height: "320px",
  background: "radial-gradient(circle, rgba(47,57,82,0.10), transparent 70%)",
  pointerEvents: "none",
};

const containerStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const heroGrid = {
  display: "grid",
  gridTemplateColumns: "1.7fr 0.9fr",
  gap: "20px",
  marginBottom: "20px",
};

const heroMainCard = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.95)",
  borderRadius: "30px",
  padding: "30px",
  boxShadow: "0 12px 34px rgba(47,57,82,0.08)",
};

const heroSideCard = {
  background: "linear-gradient(180deg, #ffffff 0%, #f6faf8 100%)",
  border: `1px solid ${BRAND.line}`,
  borderRadius: "30px",
  padding: "26px",
  boxShadow: "0 12px 34px rgba(47,57,82,0.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const eyebrowStyle = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: BRAND.green,
  fontWeight: 700,
};

const heroTitle = {
  margin: "8px 0 10px 0",
  fontSize: "34px",
  lineHeight: 1.15,
  color: BRAND.navy,
};

const heroSub = {
  color: BRAND.softText,
  margin: 0,
  fontSize: "17px",
  lineHeight: 1.7,
  maxWidth: "700px",
};

const heroMetaRow = {
  marginTop: "22px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const miniMetaCard = {
  background: "#ffffff",
  border: `1px solid ${BRAND.line}`,
  borderRadius: "18px",
  padding: "16px",
};

const miniMetaLabel = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: BRAND.softText,
  fontWeight: 700,
};

const miniMetaValue = {
  marginTop: "8px",
  color: BRAND.navy,
  fontWeight: 600,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const heroSideTop = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: BRAND.green,
  fontWeight: 700,
};

const heroSideText = {
  marginTop: "10px",
  color: BRAND.navy,
  lineHeight: 1.7,
  fontSize: "16px",
};

const mainGrid = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: "2fr 1fr",
};

const cardStyle = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(47,57,82,0.05)",
};

const streakCard = {
  background: `linear-gradient(135deg, ${BRAND.navy}, #465170)`,
  color: "white",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 12px 30px rgba(47,57,82,0.18)",
};

const brandInfoCard = {
  background: `linear-gradient(135deg, ${BRAND.green}, #87b8a3)`,
  color: "white",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 12px 30px rgba(111,165,142,0.22)",
};

const warmCardStyle = {
  background: BRAND.paleGreen,
  border: `1px solid ${BRAND.green}`,
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 10px 22px rgba(111,165,142,0.10)",
};

const sectionLabel = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: BRAND.green,
  fontWeight: 700,
};

const sectionLabelLight = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "#d6e5dd",
  fontWeight: 700,
};

const sectionTitle = {
  marginTop: "8px",
  marginBottom: "0",
  fontSize: "28px",
  color: BRAND.navy,
};

const sectionHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "12px",
  marginBottom: "18px",
};

const sectionHelper = {
  color: BRAND.softText,
  fontSize: "14px",
};

const coachNoteBox = {
  background: BRAND.paleGreen,
  border: `1px solid ${BRAND.green}`,
  padding: "16px",
  borderRadius: "18px",
  color: BRAND.navy,
  lineHeight: 1.6,
  marginTop: "12px",
};

const exerciseCard = {
  border: `1px solid ${BRAND.line}`,
  borderRadius: "20px",
  padding: "16px",
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "42px minmax(0,1fr) auto",
  gap: "14px",
  alignItems: "start",
};

const exerciseNumber = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  background: BRAND.paleBlue,
  color: BRAND.navy,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "15px",
  flexShrink: 0,
};

const smallTargetPill = {
  background: BRAND.paleBlue,
  color: BRAND.navy,
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: 700,
  whiteSpace: "nowrap",
  alignSelf: "center",
};

const historyCard = {
  border: `1px solid ${BRAND.line}`,
  borderRadius: "16px",
  padding: "14px",
  background: "#ffffff",
};

const workoutModeCard = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "28px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 12px 34px rgba(47,57,82,0.08)",
  border: "1px solid rgba(255,255,255,0.95)",
};

const progressBarOuter = {
  width: "100%",
  height: "12px",
  background: "#e3e8ef",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "20px",
};

const progressBarInner = {
  height: "100%",
  background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.navy})`,
  borderRadius: "999px",
  transition: "width 0.3s ease",
};

const workoutModeTop = {
  display: "grid",
  gridTemplateColumns: "1.4fr 220px",
  gap: "20px",
  alignItems: "center",
};

const workoutContentCard = {
  background: "#ffffff",
  border: `1px solid ${BRAND.line}`,
  borderRadius: "22px",
  padding: "22px",
};

const timerWrapCard = {
  display: "flex",
  justifyContent: "center",
};

const timerCircle = {
  width: "170px",
  height: "170px",
  borderRadius: "999px",
  background: "#ffffff",
  border: `6px solid ${BRAND.green}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 2px 10px rgba(255,255,255,0.8)",
};

const exerciseStage = {
  display: "grid",
  justifyItems: "center",
  gap: "14px",
  padding: "20px 0 8px 0",
};

const targetPill = {
  display: "inline-block",
  background: BRAND.navy,
  color: "white",
  padding: "10px 16px",
  borderRadius: "999px",
  fontWeight: 700,
};

const workoutControls = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "12px",
};

const finishRow = {
  display: "flex",
  justifyContent: "center",
  marginTop: "18px",
};

const logGrid = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "1fr 1fr",
};

const labelStyle = {
  fontSize: "14px",
  color: BRAND.navy,
  marginBottom: "6px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: `1px solid ${BRAND.line}`,
  boxSizing: "border-box",
  background: "white",
  color: BRAND.navy,
  fontSize: "15px",
};

const primaryButton = {
  background: BRAND.navy,
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 6px 16px rgba(47,57,82,0.14)",
};

const secondaryButton = {
  background: "white",
  color: BRAND.navy,
  border: `1px solid ${BRAND.line}`,
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 600,
};

const ghostButton = {
  background: "transparent",
  color: BRAND.softText,
  border: "none",
  padding: "12px 8px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 600,
};

const bigPrimaryButton = {
  width: "100%",
  background: BRAND.navy,
  color: "white",
  border: "none",
  padding: "15px 22px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "16px",
  boxShadow: "0 8px 20px rgba(47,57,82,0.16)",
};

const bigSecondaryButton = {
  width: "100%",
  background: "white",
  color: BRAND.navy,
  border: `1px solid ${BRAND.line}`,
  padding: "15px 22px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "16px",
};

const glanceRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  paddingBottom: "10px",
  borderBottom: `1px solid ${BRAND.line}`,
};

const glanceKey = {
  color: BRAND.softText,
};

const glanceValue = {
  color: BRAND.navy,
  fontWeight: 600,
  textAlign: "right",
  overflowWrap: "anywhere",
};

function phaseBadge(phase) {
  return {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 800,
    fontSize: "13px",
    background: phase === "work" ? BRAND.paleGreen : BRAND.paleBlue,
    color: BRAND.navy,
  };
}