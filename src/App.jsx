import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const sb = async (path, opts = {}) => {
  const { headers: extraHeaders, prefer, ...restOpts } = opts;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer || "return=representation",
      ...extraHeaders,
    },
    ...restOpts,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const LIGHT = {
  "--bg-page": "#f9f9f8",
  "--bg-primary": "#ffffff",
  "--bg-secondary": "#f4f3f0",
  "--text-primary": "#1a1a1a",
  "--text-secondary": "#666660",
  "--text-tertiary": "#999994",
  "--border": "rgba(0,0,0,0.12)",
  "--border-strong": "rgba(0,0,0,0.22)",
};

const DARK = {
  "--bg-page": "#1a1a1a",
  "--bg-primary": "#242422",
  "--bg-secondary": "#2e2e2b",
  "--text-primary": "#f0f0ee",
  "--text-secondary": "#999994",
  "--text-tertiary": "#666660",
  "--border": "rgba(255,255,255,0.1)",
  "--border-strong": "rgba(255,255,255,0.18)",
};

function applyTheme(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.style.background = vars["--bg-page"];
  document.body.style.color = vars["--text-primary"];
}

const PROGRAM = {
  maxes: { squat: 365, bench: 315, deadlift: 405 },
  weeks: [
    { label: "Week 1", phase: "Hypertrophy",           squat: { heavy: [1,3,256], work: [3,8,228] }, bench: { heavy: [1,3,221], work: [3,8,196] }, deadlift: { heavy: [1,3,355], work: [3,5,315] } },
    { label: "Week 2", phase: "Strength-Hypertrophy",  squat: { heavy: [1,3,292], work: [3,6,265] }, bench: { heavy: [1,3,252], work: [3,6,227] }, deadlift: { heavy: [1,3,375], work: [3,4,340] } },
    { label: "Week 3", phase: "Strength-Hypertrophy",  squat: { heavy: [1,3,292], work: [3,6,265] }, bench: { heavy: [1,3,252], work: [3,6,227] }, deadlift: { heavy: [1,3,375], work: [3,4,340] } },
    { label: "Week 4", phase: "Strength-Hypertrophy",  squat: { heavy: [1,3,292], work: [3,6,265] }, bench: { heavy: [1,3,252], work: [3,6,227] }, deadlift: { heavy: [1,3,375], work: [3,4,340] } },
    { label: "Week 5", phase: "Strength/Peaking",      squat: { heavy: [1,2,319], work: [3,4,292] }, bench: { heavy: [1,2,274], work: [3,4,252] }, deadlift: { heavy: [1,2,395], work: [3,3,365] } },
    { label: "Week 6", phase: "Strength/Peaking",      squat: { heavy: [1,2,319], work: [3,4,292] }, bench: { heavy: [1,2,274], work: [3,4,252] }, deadlift: { heavy: [1,2,395], work: [3,3,365] } },
  ],
  days: [
    {
      id: "legs1", name: "Legs 1",
      exercises: [
        { id: "squat",            name: "Back Squat",       isMain: true, mainLift: "squat" },
        { id: "rdl",              name: "RDL",              sets: 3, rpe: true },
        { id: "leg_press_single", name: "Single Leg Press", sets: 3, rpe: true },
        { id: "leg_ext_l1",       name: "Leg Extension",    sets: 3, rpe: true },
        { id: "leg_curl_l1",      name: "Leg Curl",         sets: 3, rpe: true },
        { id: "hip_abductors",    name: "Hip Abductors",    sets: 3, rpe: true },
      ],
    },
    {
      id: "push1", name: "Push 1", focus: "Shoulder Focus",
      exercises: [
        { id: "bench",         name: "Flat Barbell Bench", isMain: true, mainLift: "bench" },
        { id: "ohp_p1",        name: "Overhead Press",     sets: 3, rpe: true },
        { id: "incline_db_p1", name: "Incline DB Press",   sets: 3, rpe: true },
        { id: "lat_raises_p1", name: "Lateral Raises",     sets: 3, rpe: true, repRange: "12–15" },
        { id: "face_pulls_p1", name: "Face Pulls",         sets: 3, rpe: true, repRange: "12–15" },
        { id: "crunches_p1",   name: "Weighted Crunches",  sets: 3, rpe: true },
      ],
    },
    {
      id: "pull1", name: "Pull 1",
      exercises: [
        { id: "deadlift",              name: "Deadlift",          isMain: true, mainLift: "deadlift" },
        { id: "weighted_pullups_pull1",name: "Weighted Pull-Ups", sets: 3, rpe: true },
        { id: "cable_row_pull1",       name: "Cable Row",         sets: 3, rpe: true, repRange: "6–8" },
        { id: "face_pulls_pull1",      name: "Face Pulls",        sets: 3, rpe: true, repRange: "12–15" },
        { id: "db_curl_pull1",         name: "DB Curl",           sets: 3, rpe: true },
        { id: "crunches_pull1",        name: "Weighted Crunches", sets: 3, rpe: true },
      ],
    },
    {
      id: "legs2", name: "Legs 2",
      exercises: [
        { id: "squat",       name: "Back Squat",    isMain: true, mainLift: "squat" },
        { id: "hack_squat",  name: "Hack Squat",    sets: 3, rpe: true },
        { id: "db_step_ups", name: "DB Step-Ups",   sets: 3, rpe: true },
        { id: "ghd",         name: "GHD",           sets: 3, rpe: true },
        { id: "leg_ext_l2",  name: "Leg Extension", sets: 3, rpe: true },
        { id: "calves",      name: "Calves",        sets: 3, rpe: true, repRange: "10–15" },
      ],
    },
    {
      id: "push2", name: "Push 2", focus: "Tricep Focus",
      exercises: [
        { id: "bench",          name: "Flat Barbell Bench",      isMain: true, mainLift: "bench" },
        { id: "cgbench_p2",     name: "Close Grip Bench",        sets: 3, rpe: true },
        { id: "pushdowns_p2",   name: "Cable Tricep Pushdowns",  sets: 3, rpe: true },
        { id: "skulls_p2",      name: "Skull Crushers",          sets: 3, rpe: true },
        { id: "incline_db_p2",  name: "Incline DB Press",        sets: 3, rpe: true },
        { id: "crunches_p2",    name: "Weighted Crunches",       sets: 3, rpe: true },
      ],
    },
    {
      id: "pull2", name: "Pull 2",
      exercises: [
        { id: "deadlift",              name: "Deadlift",           isMain: true, mainLift: "deadlift" },
        { id: "pendlay_pull2",         name: "Pendlay Row",        sets: 3, rpe: true, repRange: "6–8" },
        { id: "lat_pulldown_pull2",    name: "Lat Pulldown",       sets: 3, rpe: true },
        { id: "rope_hammer_pull2",     name: "Rope Hammer Curls",  sets: 3, rpe: true },
        { id: "incline_db_curl_pull2", name: "Incline DB Curl",    sets: 3, rpe: true },
        { id: "crunches_pull2",        name: "Weighted Crunches",  sets: 3, rpe: true },
      ],
    },
  ],
};

// 5-day rotating schedule — week N picks up where week N-1 left off
const getWeekDays = (weekIdx) => {
  const startIdx = (weekIdx * 5) % 6;
  return Array.from({ length: 5 }, (_, i) => PROGRAM.days[(startIdx + i) % 6]);
};

const PHASE_COLORS = {
  "Hypertrophy": "#378ADD",
  "Strength-Hypertrophy": "#1D9E75",
  "Strength/Peaking": "#D85A30",
};

const getRpe = (weekIdx, exId) => {
  const phase = weekIdx === 0 ? "hyp" : weekIdx <= 3 ? "bridge" : "peak";
  const isLight = exId.includes("raises") || exId.includes("abductor") || exId.includes("calves");
  return {
    hyp:    { default: "RPE 7",   light: "RPE 6"   },
    bridge: { default: "RPE 7.5", light: "RPE 7"   },
    peak:   { default: "RPE 8",   light: "RPE 7.5" },
  }[phase][isLight ? "light" : "default"];
};

const getRepRange = (ex, weekIdx) => {
  if (ex.repRange) return ex.repRange;
  if (weekIdx === 0) return "8–12";
  if (weekIdx <= 3) return "6–10";
  return "4–8";
};

function Timer({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = setInterval(() => setRemaining(r => r - 1), 1000);
    } else {
      clearInterval(ref.current);
      if (remaining === 0 && running) setRunning(false);
    }
    return () => clearInterval(ref.current);
  }, [running, remaining]);

  const start = (s) => { setSelected(s); setRemaining(s); setRunning(true); };
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const circ = 2 * Math.PI * 54;
  const pct = selected ? remaining / selected : 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "var(--bg-primary)", borderRadius: 20, padding: "2rem", width: 280, textAlign: "center", border: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontWeight: 500, fontSize: 16, color: "var(--text-primary)" }}>Rest Timer</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: "block", margin: "0 auto 1.5rem" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none"
            stroke={remaining === 0 && selected ? "#1D9E75" : "#378ADD"} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ - pct * circ}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1s linear" }} />
          <text x="60" y="56" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="500">
            {mins}:{String(secs).padStart(2, "0")}
          </text>
          {remaining === 0 && selected && (
            <text x="60" y="76" textAnchor="middle" fill="#1D9E75" fontSize="12">Done!</text>
          )}
        </svg>
        <div style={{ display: "flex", gap: 10 }}>
          {[90, 180].map(s => (
            <button key={s} onClick={() => start(s)} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontWeight: 500,
              border: `2px solid ${selected === s ? "#378ADD" : "var(--border)"}`,
              background: selected === s ? "#E6F1FB" : "transparent",
              color: selected === s ? "#185FA5" : "var(--text-primary)",
            }}>
              {s === 90 ? "90s" : "3 min"}
            </button>
          ))}
        </div>
        {running && (
          <button onClick={() => { setRunning(false); setRemaining(0); setSelected(null); }}
            style={{ marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 10, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontSize: 13 }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function SetRow({ setNum, set, onUpdate, suggested, prev }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 72px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid var(--border)" }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>{setNum}</span>
      <div>
        <input type="number" inputMode="decimal" placeholder={suggested || "lbs"} value={set.weight || ""}
          onChange={e => onUpdate({ ...set, weight: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-secondary)", fontSize: 14, color: "var(--text-primary)" }} />
        {prev && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Prev: {prev} lbs</div>}
      </div>
      <input type="number" inputMode="numeric" placeholder="reps" value={set.reps || ""}
        onChange={e => onUpdate({ ...set, reps: e.target.value })}
        style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-secondary)", fontSize: 14, color: "var(--text-primary)" }} />
      <span style={{ fontSize: 11, textAlign: "center", color: set.weight && set.reps ? "#1D9E75" : "var(--text-tertiary)" }}>
        {set.weight && set.reps ? "✓" : "–"}
      </span>
    </div>
  );
}

function ExerciseCard({ ex, weekIdx, dayId, logs, onLog }) {
  const wk = PROGRAM.weeks[weekIdx];
  const isMain = !!ex.isMain;
  const md = isMain ? wk[ex.mainLift] : null;
  const [extra, setExtra] = useState(0);

  const key = (type, i) => `${dayId}_${ex.id}_${type}_${i}`;
  const get = (type, i) => logs[key(type, i)] || {};
  const set = (type, i, val) => onLog(key(type, i), val);
  const prev = (type, i) => logs[key(type, i)]?.weight || null;

  const workSets = isMain ? md.work[0] + extra : (ex.sets || 3) + extra;

  return (
    <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>{ex.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {isMain
              ? `Heavy: ${md.heavy[0]}×${md.heavy[1]} @ ${md.heavy[2]} lbs · Back-off: ${md.work[0]}×${md.work[1]} @ ${md.work[2]} lbs`
              : `${ex.sets || 3} sets · ${getRepRange(ex, weekIdx)} reps · ${getRpe(weekIdx, ex.id)}`}
          </div>
        </div>
        {isMain && (
          <span style={{ fontSize: 11, background: "#E6F1FB", color: "#185FA5", padding: "3px 10px", borderRadius: 20, fontWeight: 500, marginLeft: 8, flexShrink: 0 }}>Main Lift</span>
        )}
      </div>

      {isMain && (
        <>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", margin: "8px 0 6px" }}>Heavy Set</div>
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 72px", gap: 8, marginBottom: 4 }}>
            {["#", "Weight (lbs)", "Reps", ""].map((h, i) => (
              <span key={i} style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: i === 3 ? "center" : "left" }}>{h}</span>
            ))}
          </div>
          <SetRow setNum="H" set={get("heavy", 0)} onUpdate={v => set("heavy", 0, v)} suggested={md.heavy[2]} prev={prev("heavy", 0)} />
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", margin: "10px 0 6px" }}>Working Sets</div>
        </>
      )}

      {!isMain && (
        <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 72px", gap: 8, marginBottom: 4 }}>
          {["#", "Weight (lbs)", "Reps", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: i === 3 ? "center" : "left" }}>{h}</span>
          ))}
        </div>
      )}

      {Array.from({ length: workSets }).map((_, i) => (
        <SetRow key={i} setNum={i + 1} set={get("work", i)} onUpdate={v => set("work", i, v)}
          suggested={isMain ? md.work[2] : null} prev={prev("work", i)} />
      ))}

      <button onClick={() => setExtra(e => e + 1)}
        style={{ marginTop: 10, width: "100%", padding: "7px 0", borderRadius: 8, border: "0.5px dashed var(--border)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
        + Add set
      </button>
    </div>
  );
}

function WorkoutView({ onBack, onTimer, logs, onLog }) {
  const [weekIdx, setWeekIdx] = useState(0);
  const [daySlot, setDaySlot] = useState(0);
  const week = PROGRAM.weeks[weekIdx];
  const weekDays = getWeekDays(weekIdx);
  const day = weekDays[daySlot];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontWeight: 500, fontSize: 18, color: "var(--text-primary)" }}>Workout</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{week.label} · {week.phase}</div>
        </div>
        <button onClick={onTimer} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 10, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text-primary)" }}>
          ⏱ Timer
        </button>
      </div>

      {/* Week selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", overflowX: "auto", paddingBottom: 4 }}>
        {PROGRAM.weeks.map((wk, i) => (
          <button key={i} onClick={() => { setWeekIdx(i); setDaySlot(0); }} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13,
            fontWeight: weekIdx === i ? 500 : 400,
            border: `1.5px solid ${weekIdx === i ? PHASE_COLORS[wk.phase] : "var(--border)"}`,
            background: weekIdx === i ? "var(--bg-secondary)" : "transparent",
            color: weekIdx === i ? PHASE_COLORS[wk.phase] : "var(--text-secondary)",
          }}>W{i + 1}</button>
        ))}
      </div>

      {/* Day selector — shows 5 rotating days for this week */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", overflowX: "auto", paddingBottom: 4 }}>
        {weekDays.map((d, i) => (
          <button key={i} onClick={() => setDaySlot(i)} style={{
            flexShrink: 0, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 13,
            fontWeight: daySlot === i ? 500 : 400,
            border: `1.5px solid ${daySlot === i ? "#378ADD" : "var(--border)"}`,
            background: daySlot === i ? "#E6F1FB" : "transparent",
            color: daySlot === i ? "#185FA5" : "var(--text-secondary)",
          }}>
            {d.name}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, color: "var(--text-primary)" }}>{day.name}</div>
          {day.focus && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{day.focus}</div>}
        </div>
        <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 500, background: PHASE_COLORS[week.phase] + "22", color: PHASE_COLORS[week.phase] }}>
          {week.phase}
        </span>
      </div>

      {day.exercises.map(ex => (
        <ExerciseCard key={`${ex.id}-${weekIdx}-${daySlot}`} ex={ex} weekIdx={weekIdx}
          dayId={`${day.id}_w${weekIdx}`} logs={logs} onLog={onLog} />
      ))}
    </div>
  );
}

function AnalyticsView({ onBack, logs }) {
  const lifts = ["squat", "bench", "deadlift"];
  const labels = { squat: "Squat", bench: "Bench", deadlift: "Deadlift" };
  const colors = { squat: "#378ADD", bench: "#D85A30", deadlift: "#1D9E75" };

  const chartData = PROGRAM.weeks.map((_, wi) => {
    const row = { week: `W${wi + 1}` };
    lifts.forEach(lift => {
      let best = null;
      PROGRAM.days.forEach(day => {
        const ex = day.exercises.find(e => e.mainLift === lift);
        if (!ex) return;
        ["heavy", "work"].forEach(type => {
          for (let i = 0; i < 10; i++) {
            const val = logs[`${day.id}_w${wi}_${ex.id}_${type}_${i}`];
            if (val?.weight) {
              const w = parseFloat(val.weight);
              if (!best || w > best) best = w;
            }
          }
        });
      });
      if (best) row[lift] = best;
    });
    return row;
  });

  const prs = {};
  lifts.forEach(lift => {
    let pr = PROGRAM.maxes[lift];
    Object.entries(logs).forEach(([k, v]) => {
      if (k.includes(`_${lift}_`) || k.includes(`_${lift === "squat" ? "squat" : lift}_`)) {
        if (v?.weight && parseFloat(v.weight) > pr) pr = parseFloat(v.weight);
      }
    });
    prs[lift] = pr;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 22 }}>←</button>
        <div style={{ fontWeight: 500, fontSize: 18, color: "var(--text-primary)" }}>Analytics</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {lifts.map(lift => (
          <div key={lift} style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{labels[lift]}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: colors[lift] }}>{prs[lift]}</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>lbs</div>
            {prs[lift] > PROGRAM.maxes[lift] && (
              <div style={{ fontSize: 11, color: "#1D9E75", fontWeight: 500, marginTop: 4 }}>🏆 New PR!</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: "1rem", color: "var(--text-primary)" }}>Top weight logged per week</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
            <Tooltip contentStyle={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {lifts.map(lift => (
              <Line key={lift} type="monotone" dataKey={lift} name={labels[lift]} stroke={colors[lift]} strokeWidth={2} dot={{ r: 4 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: "0.875rem 1rem" }}>
        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8, color: "var(--text-primary)" }}>Starting maxes</div>
        {lifts.map(lift => (
          <div key={lift} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>{labels[lift]}</span>
            <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{PROGRAM.maxes[lift]} lbs</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeView({ onWorkout, onAnalytics, theme, toggleTheme }) {
  const phaseColors = PHASE_COLORS;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>Powerbuilding</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>6-week push / pull / legs</div>
        </div>
        <button onClick={toggleTheme} title="Toggle theme"
          style={{ padding: "8px 12px", borderRadius: 20, border: "0.5px solid var(--border)", background: "var(--bg-secondary)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
        <button onClick={onWorkout} style={{ padding: "1.25rem", borderRadius: 14, border: "0.5px solid var(--border)", background: "var(--bg-primary)", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🏋️</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>Start Workout</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>Log sets & reps</div>
        </button>
        <button onClick={onAnalytics} style={{ padding: "1.25rem", borderRadius: 14, border: "0.5px solid var(--border)", background: "var(--bg-primary)", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>Analytics</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>Progress & PRs</div>
        </button>
      </div>

      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "var(--text-secondary)" }}>Program overview</div>
      {PROGRAM.weeks.map((wk, i) => {
        const days = getWeekDays(i);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, background: phaseColors[wk.phase] + "1a", color: phaseColors[wk.phase] }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{wk.label} — {wk.phase}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {days.map(d => d.name).join(" · ")}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10, color: "var(--text-secondary)" }}>Your maxes</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[["Squat", 365, "#378ADD"], ["Bench", 315, "#D85A30"], ["Deadlift", 405, "#1D9E75"]].map(([name, val, col]) => (
            <div key={name} style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "0.75rem", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{name}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: col, marginTop: 2 }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>lbs</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [timer, setTimer] = useState(false);
  const [logs, setLogs] = useState({});
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("pb_theme") || "light");

  // Apply theme variables whenever theme changes
  useEffect(() => {
    const vars = theme === "light" ? LIGHT : DARK;
    applyTheme(vars);
    localStorage.setItem("pb_theme", theme);
  }, [theme]);

  useEffect(() => { initDB(); }, []);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const initDB = async () => {
    try {
      await sb("workout_logs?limit=1", { method: "GET", headers: { Range: "0-0" } });
      setReady(true);
      loadLogs();
    } catch {
      setNotice("Running in offline mode — logs will save once deployed to Vercel.");
      setReady(true);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await sb("workout_logs?select=log_key,weight,reps", { method: "GET" });
      if (data) {
        const parsed = {};
        data.forEach(r => { parsed[r.log_key] = { weight: r.weight, reps: r.reps }; });
        setLogs(parsed);
      }
    } catch (e) { console.error(e); }
  };

  const onLog = async (key, val) => {
    setLogs(prev => ({ ...prev, [key]: val }));
    try {
      await sb("workout_logs", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ log_key: key, weight: val.weight || null, reps: val.reps || null }),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {notice && (
        <div style={{ background: "#FFF8E6", border: "0.5px solid #FAC775", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: 13, color: "#854F0B" }}>
          ℹ️ {notice}
        </div>
      )}
      {ready && (
        <>
          {view === "home" && <HomeView onWorkout={() => setView("workout")} onAnalytics={() => setView("analytics")} theme={theme} toggleTheme={toggleTheme} />}
          {view === "workout" && <WorkoutView onBack={() => setView("home")} onTimer={() => setTimer(true)} logs={logs} onLog={onLog} />}
          {view === "analytics" && <AnalyticsView onBack={() => setView("home")} logs={logs} />}
        </>
      )}
      {timer && <Timer onClose={() => setTimer(false)} />}
    </div>
  );
}
