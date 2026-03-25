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
};

const STORAGE_KEY = "fit-around-life-v2";

const CHALLENGES = [
  "Let one of the kids be your coach for one round.",
  "Do every squat with a 2-second pause at the bottom.",
  "Add one extra minute of brisk marching at the end.",
  "Do the whole session with perfect posture focus.",
  "Let the kids count all your reps out loud.",
  "Add 5 bonus glute bridges after each round.",
  "Finish with 30 seconds of side steps with a smile.",
  "Do one round extra slowly and cleanly.",
];

const SESSION_LIBRARY = {
  lower_strength: {
    label: "Lower Body Strength",
    focus: "Legs, glutes and steady strength",
    exercises: [
      { name: "Squats", baseReps: 14, unit: "reps", notes: "Slow and controlled" },
      { name: "Split squats", baseReps: 8, unit: "each leg", notes: "Use balance support if needed" },
      { name: "Glute bridges", baseReps: 14, unit: "reps", notes: "Pause at the top" },
      { name: "Fast march", baseTime: 30, unit: "sec", notes: "Steady cardio push" },
      { name: "Dead bugs", baseReps: 8, unit: "each side", notes: "Brace the core throughout" },
    ],
  },
  cardio_core: {
    label: "Cardio + Core",
    focus: "Raise the heart rate and stay stable through the trunk",
    exercises: [
      { name: "High knees or march", baseTime: 35, unit: "sec", notes: "Keep it light on the wrist" },
      { name: "Side steps", baseTime: 35, unit: "sec", notes: "Stay quick and smooth" },
      { name: "Dead bugs", baseReps: 10, unit: "each side", notes: "Slow quality reps" },
      { name: "Standing reach + brace", baseReps: 10, unit: "reps", notes: "Tall posture, controlled breathing" },
      { name: "Tempo squats", baseReps: 10, unit: "reps", notes: "3 seconds down" },
    ],
  },
  recovery_mobility: {
    label: "Recovery + Mobility",
    focus: "Reset the body and keep moving without digging a hole",
    exercises: [
      { name: "Brisk walk / march", baseTime: 120, unit: "sec", notes: "Easy and smooth" },
      { name: "Slow squats", baseReps: 10, unit: "reps", notes: "Loosen the legs" },
      { name: "Hip mobility", baseTime: 90, unit: "sec", notes: "Circles and openers" },
      { name: "Torso twists", baseTime: 60, unit: "sec", notes: "Gentle and rhythmic" },
      { name: "Standing reach + brace", baseReps: 8, unit: "reps", notes: "Keep it easy" },
    ],
  },
  balance_stability: {
    label: "Balance + Stability",
    focus: "Control, balance and small stabilisers",
    exercises: [
      { name: "Reverse lunges", baseReps: 8, unit: "each leg", notes: "Controlled and upright" },
      { name: "Single-leg glute bridge", baseReps: 6, unit: "each leg", notes: "Only if comfortable" },
      { name: "Standing reach + brace", baseReps: 10, unit: "reps", notes: "Core control" },
      { name: "Side steps", baseTime: 30, unit: "sec", notes: "Stay light on your feet" },
      { name: "Dead bugs", baseReps: 8, unit: "each side", notes: "Smooth controlled reps" },
    ],
  },
  mixed_conditioning: {
    label: "Mixed Conditioning",
    focus: "A full-body session with a steady sweat",
    exercises: [
      { name: "Squats", baseReps: 12, unit: "reps", notes: "Comfortable rhythm" },
      { name: "Reverse lunges", baseReps: 8, unit: "each leg", notes: "Stay controlled" },
      { name: "Fast march", baseTime: 40, unit: "sec", notes: "Build the heart rate" },
      { name: "Glute bridges", baseReps: 12, unit: "reps", notes: "Squeeze at the top" },
      { name: "Dead bugs", baseReps: 8, unit: "each side", notes: "Brace and breathe" },
    ],
  },
  posture_core: {
    label: "Posture + Core",
    focus: "Upper-body posture and central stability",
    exercises: [
      { name: "Invisible band pull-aparts", baseReps: 15, unit: "reps", notes: "Open the chest and back" },
      { name: "Standing reach + brace", baseReps: 12, unit: "reps", notes: "Tall posture" },
      { name: "Dead bugs", baseReps: 10, unit: "each side", notes: "Quality over speed" },
      { name: "Torso twists", baseTime: 60, unit: "sec", notes: "Easy mobility" },
      { name: "March on spot", baseTime: 90, unit: "sec", notes: "Keep moving" },
    ],
  },
  lower_power_light: {
    label: "Lower Body Power Light",
    focus: "Livelier leg work without going too aggressive",
    exercises: [
      { name: "Tempo squats", baseReps: 12, unit: "reps", notes: "Control the lowering phase" },
      { name: "Split squats", baseReps: 8, unit: "each leg", notes: "Stable and upright" },
      { name: "Side steps", baseTime: 35, unit: "sec", notes: "Quick but relaxed" },
      { name: "Glute bridges", baseReps: 14, unit: "reps", notes: "Strong squeeze at the top" },
      { name: "Fast march", baseTime: 30, unit: "sec", notes: "Finish with energy" },
    ],
  },
};

const DEFAULT_STATE = {
  history: [],
  sessionIndex: 0,
  rounds: "3",
  effort: "good",
  energy: 3,
  wrist: 2,
  notes: "",
  kidsJoined: false,
  workoutMode: false,
  currentExerciseIndex: 0,
  phase: "work",
  timerRunning: false,
  timeLeft: 40,
  environment: "garden",
  equipment: [],
  photo: null,
  profile: {
    fitnessLevel: 1,
    preferredMinutes: 20,
    wristSensitivity: true,
    progressionScore: 0,
    challengeCompletions: 0,
    lastSessionType: "",
  },
};

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(parsed.profile || {}),
      },
      equipment: parsed.equipment || [],
      environment: parsed.environment || "garden",
      photo: parsed.photo || null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function cloneExercise(ex) {
  return { ...ex };
}

function isoFromLocaleDate(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getChallengeForDate(todayKey) {
  if (!todayKey) return CHALLENGES[0];
  const seed = todayKey
    .split("-")
    .join("")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);
  return CHALLENGES[seed % CHALLENGES.length];
}

function getStreak(history) {
  if (!history.length) return 0;
  const uniqueDates = [...new Set(history.map((item) => isoFromLocaleDate(item.date)))].sort().reverse();

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
}

function chooseSessionType(history, profile, todayKey) {
  const allTypes = Object.keys(SESSION_LIBRARY);
  const last = history[0];
  const lastType = profile.lastSessionType || "";

  if (last?.effort === "hard" || last?.energy <= 2) {
    return "recovery_mobility";
  }

  if (last?.wrist >= 4) {
    return "posture_core";
  }

  const preferredOrder = [
    "lower_strength",
    "cardio_core",
    "balance_stability",
    "mixed_conditioning",
    "posture_core",
    "lower_power_light",
    "recovery_mobility",
  ];

  const seed = todayKey
    .split("-")
    .join("")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);

  let candidate = preferredOrder[seed % preferredOrder.length];

  if (candidate === lastType) {
    const idx = (preferredOrder.indexOf(candidate) + 1) % preferredOrder.length;
    candidate = preferredOrder[idx];
  }

  if (!allTypes.includes(candidate)) return "lower_strength";
  return candidate;
}

function buildSession(typeKey, profile, history, environment, equipment) {
  const base = SESSION_LIBRARY[typeKey];
  const progressionLevel = profile.fitnessLevel || 1;
  const previous = history[0];

  let roundGuide = progressionLevel <= 1 ? "Aim for 2–3 rounds today." : "Aim for 3 rounds today.";
  let coachNote = "A sensible session for today. Stay smooth, not heroic.";

  let exercises = base.exercises.map((raw) => {
    const ex = cloneExercise(raw);

    if (ex.baseReps != null) {
      let reps = ex.baseReps + Math.max(0, progressionLevel - 1) * 2;
      if (previous?.effort === "hard" || previous?.energy <= 2) reps = Math.max(ex.baseReps, reps - 2);
      ex.target = `${reps} ${ex.unit}`;
    } else {
      let time = ex.baseTime + Math.max(0, progressionLevel - 1) * 5;
      if (previous?.effort === "hard" || previous?.energy <= 2) time = Math.max(ex.baseTime, time - 5);
      ex.target = `${time} ${ex.unit}`;
    }

    if (previous?.wrist >= 4 && ex.name.toLowerCase().includes("plank")) {
      ex.name = "Dead bugs";
      ex.notes = "Swap plank out to protect the wrist";
      ex.target = `${10 + Math.max(0, progressionLevel - 1) * 2} each side`;
    }

    return ex;
  });

  if (previous?.effort === "good" && previous?.energy >= 3 && previous?.wrist <= 2) {
    coachNote = "Nice work last time. This session nudges things forward a touch.";
    roundGuide = progressionLevel <= 1 ? "Aim for 3 rounds today." : "Aim for 3–4 rounds today.";
  }

  if (previous?.effort === "hard") {
    coachNote = "Last session sounded like enough. Keep this one controlled and leave a bit in the tank.";
  }

  if (previous?.wrist >= 4) {
    coachNote = "The wrist looked a bit grumpy last time, so today stays friendly and controlled.";
  }

  if (previous?.energy <= 2) {
    coachNote += " An 80% session is a win today.";
  }

  // Environment-based adaptations
  if (environment === "garden") {
    exercises.push({
      name: "Garden laps",
      target: "60 sec",
      notes: "Use the full space available",
    });
  }

  if (environment === "room") {
    exercises.push({
      name: "March in place",
      target: "60 sec",
      notes: "Low-space cardio option",
    });
  }

  if (environment === "park") {
    exercises.push({
      name: "Brisk shuttle walks",
      target: "60 sec",
      notes: "Use open space",
    });
  }

  if (environment === "beach") {
    exercises.push({
      name: "Soft-surface squats",
      target: "12 reps",
      notes: "Move steadily on uneven ground",
    });
  }

  if (environment === "playground") {
    exercises.push({
      name: "Bench step overs",
      target: "10 each side",
      notes: "Use low stable edges only",
    });
  }

  if (equipment.includes("Chair")) {
    exercises.push({
      name: "Chair sit-to-stands",
      target: "12 reps",
      notes: "Controlled up and down",
    });
  }

  if (equipment.includes("Bench")) {
    exercises.push({
      name: "Bench step ups",
      target: "10 each leg",
      notes: "Use a stable surface",
    });
  }

  if (equipment.includes("Wall")) {
    exercises.push({
      name: "Wall sit",
      target: "30 sec",
      notes: "Back flat against the wall",
    });
  }

  if (equipment.includes("Steps")) {
    exercises.push({
      name: "Step calf raises",
      target: "15 reps",
      notes: "Use the edge carefully",
    });
  }

  if (equipment.includes("Table")) {
    exercises.push({
      name: "Table incline hold",
      target: "20 sec",
      notes: "Only if very stable and wrist feels okay",
    });
  }

  if (equipment.includes("Resistance band")) {
    exercises.push({
      name: "Band rows",
      target: "12 reps",
      notes: "Smooth pull and squeeze",
    });
  }

  if (equipment.includes("Dumbbells")) {
    exercises.push({
      name: "Dumbbell goblet squats",
      target: "10 reps",
      notes: "Only if comfortable and available",
    });
  }

  return {
    typeKey,
    title: `${base.label} · Level ${profile.fitnessLevel}`,
    focus: base.focus,
    focusLine: base.focus,
    coachNote,
    roundGuide,
    exercises,
  };
}

export default function App() {
  const initial = useMemo(() => loadSavedState(), []);
  const [history, setHistory] = useState(initial.history);
  const [sessionIndex, setSessionIndex] = useState(initial.sessionIndex);
  const [rounds, setRounds] = useState(initial.rounds);
  const [effort, setEffort] = useState(initial.effort);
  const [energy, setEnergy] = useState(initial.energy);
  const [wrist, setWrist] = useState(initial.wrist);
  const [notes, setNotes] = useState(initial.notes);
  const [kidsJoined, setKidsJoined] = useState(initial.kidsJoined);
  const [workoutMode, setWorkoutMode] = useState(initial.workoutMode);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(initial.currentExerciseIndex);
  const [phase, setPhase] = useState(initial.phase);
  const [timerRunning, setTimerRunning] = useState(initial.timerRunning);
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [profile, setProfile] = useState(initial.profile);
  const [todayKey, setTodayKey] = useState(new Date().toISOString().slice(0, 10));
  const [challengeDone, setChallengeDone] = useState(false);

  // STEP 1 — new state
  const [environment, setEnvironment] = useState(initial.environment || "garden");
  const [equipment, setEquipment] = useState(initial.equipment || []);
  const [photo, setPhoto] = useState(initial.photo || null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setTodayKey(today);

    const lastSavedDate = history[0] ? isoFromLocaleDate(history[0].date) : "";
    setChallengeDone(lastSavedDate === today && !!history[0]?.challengeDone);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        history,
        sessionIndex,
        rounds,
        effort,
        energy,
        wrist,
        notes,
        kidsJoined,
        workoutMode,
        currentExerciseIndex,
        phase,
        timerRunning,
        timeLeft,
        profile,
        environment,
        equipment,
        photo,
      })
    );
  }, [
    history,
    sessionIndex,
    rounds,
    effort,
    energy,
    wrist,
    notes,
    kidsJoined,
    workoutMode,
    currentExerciseIndex,
    phase,
    timerRunning,
    timeLeft,
    profile,
    environment,
    equipment,
    photo,
  ]);

  const streakCount = useMemo(() => getStreak(history), [history]);
  const currentChallenge = useMemo(() => getChallengeForDate(todayKey), [todayKey]);

  const sessionType = useMemo(
    () => chooseSessionType(history, profile, todayKey),
    [history, profile, todayKey]
  );

  const adaptedSession = useMemo(
    () => buildSession(sessionType, profile, history, environment, equipment),
    [sessionType, profile, history, environment, equipment]
  );

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

  // STEP 2 — equipment toggle function
  function toggleEquipment(item) {
    setEquipment((prev) =>
      prev.includes(item)
        ? prev.filter((e) => e !== item)
        : [...prev, item]
    );
  }

  // STEP 3 — photo handler
  function handlePhoto(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

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

  function completeSession() {
    let nextFitnessLevel = profile.fitnessLevel;
    let nextProgressionScore = profile.progressionScore;

    if (effort === "good" && energy >= 3 && wrist <= 2) {
      nextProgressionScore += 1;
    } else if (effort === "hard" || energy <= 2 || wrist >= 4) {
      nextProgressionScore = Math.max(0, nextProgressionScore - 1);
    }

    if (nextProgressionScore >= 3) {
      nextFitnessLevel += 1;
      nextProgressionScore = 0;
    }

    const entry = {
      date: new Date().toLocaleDateString(),
      sessionNumber: sessionIndex + 1,
      sessionTitle: adaptedSession.title,
      sessionType: adaptedSession.typeKey,
      rounds,
      effort,
      energy,
      wrist,
      notes,
      kidsJoined,
      challengeDone,
      environment,
      equipment,
    };

    setHistory((prev) => [entry, ...prev]);
    setSessionIndex((prev) => prev + 1);
    setProfile((prev) => ({
      ...prev,
      fitnessLevel: nextFitnessLevel,
      progressionScore: nextProgressionScore,
      challengeCompletions: prev.challengeCompletions + (challengeDone ? 1 : 0),
      lastSessionType: adaptedSession.typeKey,
    }));

    setRounds("3");
    setEffort("good");
    setEnergy(3);
    setWrist(2);
    setNotes("");
    setKidsJoined(false);
    setChallengeDone(false);
    stopWorkoutMode();
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setSessionIndex(0);
    setRounds("3");
    setEffort("good");
    setEnergy(3);
    setWrist(2);
    setNotes("");
    setKidsJoined(false);
    setWorkoutMode(false);
    setCurrentExerciseIndex(0);
    setPhase("work");
    setTimerRunning(false);
    setTimeLeft(40);
    setProfile(DEFAULT_STATE.profile);
    setChallengeDone(false);
    setEnvironment("garden");
    setEquipment([]);
    setPhoto(null);
  }

  const currentExercise = adaptedSession.exercises[currentExerciseIndex];
  const progressPercent = ((currentExerciseIndex + 1) / adaptedSession.exercises.length) * 100;

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
Challenge done: ${latest.challengeDone ? "Yes" : "No"}
Environment: ${latest.environment}
Equipment: ${latest.equipment?.join(", ") || "None"}
Fitness level: ${profile.fitnessLevel}
Current streak: ${streakCount} day${streakCount === 1 ? "" : "s"}
Notes: ${latest.notes || "None"}`;
  }, [history, profile.fitnessLevel, streakCount]);

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
                <div style={miniMetaLabel}>Growth level</div>
                <div style={miniMetaValue}>Level {profile.fitnessLevel}</div>
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
                <button onClick={startWorkoutMode} style={bigPrimaryButton}>Start Workout Mode</button>
              ) : (
                <button onClick={stopWorkoutMode} style={bigSecondaryButton}>Exit Workout Mode</button>
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
              <button onClick={completeSession} style={bigPrimaryButton}>Finish & Log Session</button>
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

            {/* STEP 4 — environment UI card */}
            <div style={cardStyle}>
              <div style={sectionLabel}>Environment</div>
              <h2 style={sectionTitle}>Today’s environment</h2>

              <div style={{ marginTop: "18px" }}>
                <div style={labelStyle}>Space</div>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  style={inputStyle}
                >
                  <option value="garden">Small garden</option>
                  <option value="room">Hotel / living room</option>
                  <option value="park">Park</option>
                  <option value="beach">Beach</option>
                  <option value="playground">Playground</option>
                </select>
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={labelStyle}>Available equipment / objects</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {["Chair", "Bench", "Wall", "Steps", "Table", "Resistance band", "Dumbbells"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: "12px",
                        border: equipment.includes(item)
                          ? `2px solid ${BRAND.green}`
                          : `1px solid ${BRAND.line}`,
                        background: equipment.includes(item) ? BRAND.paleGreen : "white",
                        color: BRAND.navy,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <div style={labelStyle}>Upload space photo (optional)</div>
                <input type="file" accept="image/*" onChange={handlePhoto} />
                {photo && (
                  <img
                    src={photo}
                    alt="Environment preview"
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      borderRadius: "16px",
                      border: `1px solid ${BRAND.line}`,
                    }}
                  />
                )}
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
                  <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} style={{ width: "100%" }} />
                  <div style={{ color: BRAND.softText, marginTop: "6px" }}>{energy}/5</div>
                </label>

                <label>
                  <div style={labelStyle}>Wrist discomfort (1 fine – 5 bad)</div>
                  <input type="range" min="1" max="5" value={wrist} onChange={(e) => setWrist(Number(e.target.value))} style={{ width: "100%" }} />
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

              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", color: BRAND.navy }}>
                <input type="checkbox" checked={challengeDone} onChange={(e) => setChallengeDone(e.target.checked)} />
                <span>Challenge completed today</span>
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "22px" }}>
                <button onClick={completeSession} style={primaryButton}>Complete session and move to next</button>
                <button onClick={() => navigator.clipboard.writeText(shareText)} style={secondaryButton}>Copy summary for ChatGPT</button>
                <button onClick={resetAll} style={ghostButton}>Reset plan</button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            <div style={streakCard}>
              <div style={sectionLabelLight}>Momentum</div>
              <h2 style={{ marginTop: "6px", marginBottom: "10px" }}>Streak counter</h2>
              <div style={{ fontSize: "52px", fontWeight: 800, lineHeight: 1 }}>{streakCount}</div>
              <p style={{ color: "#d6e5dd", marginTop: "10px", marginBottom: 0 }}>
                day{streakCount === 1 ? "" : "s"} in a row
              </p>
            </div>

            <div style={warmCardStyle}>
              <div style={sectionLabel}>Today’s extra twist</div>
              <h2 style={{ marginTop: "6px", color: BRAND.navy, marginBottom: "10px" }}>Challenge of the day</h2>
              <div style={{ color: BRAND.navy, lineHeight: 1.6 }}>{currentChallenge}</div>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>Snapshot</div>
              <h2 style={sectionTitle}>Today at a glance</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={glanceRow}>
                  <span style={glanceKey}>Session type</span>
                  <span style={glanceValue}>{SESSION_LIBRARY[adaptedSession.typeKey].label}</span>
                </div>
                <div style={glanceRow}>
                  <span style={glanceKey}>Level</span>
                  <span style={glanceValue}>{profile.fitnessLevel}</span>
                </div>
                <div style={glanceRow}>
                  <span style={glanceKey}>Space</span>
                  <span style={glanceValue}>{environment}</span>
                </div>
                <div style={glanceRow}>
                  <span style={glanceKey}>Equipment</span>
                  <span style={glanceValue}>{equipment.length ? equipment.join(", ") : "None"}</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionLabel}>How it works</div>
              <h2 style={sectionTitle}>How this works</h2>
              <ol style={{ paddingLeft: "20px", color: BRAND.navy, lineHeight: 1.8, marginBottom: 0 }}>
                <li>Sessions rotate for variety and freshness.</li>
                <li>Hard days are followed by lighter choices when needed.</li>
                <li>Consistent strong sessions build your fitness level over time.</li>
                <li>Your progress and environment are saved locally on this device.</li>
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
                        Space: {item.environment} · Equipment: {item.equipment?.join(", ") || "None"}
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
              <p>• Designed to grow with your fitness</p>
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
          <div style={{ marginTop: "10px", fontSize: "16px", color: BRAND.softText, fontStyle: "italic", letterSpacing: "0.01em" }}>
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