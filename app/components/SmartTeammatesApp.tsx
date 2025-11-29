"use client";

import { useEffect, useRef, useState } from "react";
import { AISimulation } from "@/lib/ai/simulation";
import {
  CommandType,
  MovementSpeedPreset,
  SimulationOptions,
  SimulationSnapshot
} from "@/lib/ai/types";

const speedLabels: Record<MovementSpeedPreset, string> = {
  standard: "Standard",
  fast: "Fast",
  veryFast: "Very Fast"
};

const defaultOptions: SimulationOptions = {
  damageMultiplier: 1,
  movementSpeedPreset: "standard"
};

const commandDescriptions: Record<CommandType, string> = {
  hold: "Bots anchor and rely on cover fire whilst guarding current lanes.",
  regroup: "All non-leader bots collapse on the leader to reform formation.",
  assault: "Team pushes forward aggressively into the target zone."
};

export function SmartTeammatesApp() {
  const [options, setOptions] = useState<SimulationOptions>(defaultOptions);
  const [command, setCommand] = useState<CommandType>("hold");
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>();
  const [assaultMarker, setAssaultMarker] = useState<{ x: number; y: number } | undefined>();
  const simulationRef = useRef<AISimulation | null>(null);

  useEffect(() => {
    const simulation = new AISimulation(defaultOptions);
    simulationRef.current = simulation;
    setSnapshot(simulation.getSnapshot());

    const interval = setInterval(() => {
      simulation.tick();
      setSnapshot(simulation.getSnapshot());
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const sim = simulationRef.current;
    if (!sim) return;
    sim.updateOptions(options);
  }, [options]);

  const handleCommandChange = (type: CommandType) => {
    const sim = simulationRef.current;
    setCommand(type);
    if (type === "assault") {
      const marker = { x: 65, y: 35 };
      setAssaultMarker(marker);
      sim?.setCommand(type, marker);
    } else {
      setAssaultMarker(undefined);
      sim?.setCommand(type);
    }
  };

  const activeBots = snapshot?.bots ?? [];
  const enemies = snapshot?.enemies ?? [];
  const log = snapshot?.log ?? [];

  const tacticalSummary = (() => {
    if (!snapshot) return "Initializing battlefield telemetry...";
    if (!snapshot.bots.length) return "Awaiting deployment data...";
    const engaged = snapshot.bots.filter((bot) => bot.state === "engaging" || bot.state === "assaulting").length;
    const suppressed = snapshot.enemies.filter((enemy) => enemy.isSuppressed).length;
    const highestThreat = snapshot.enemies.length
      ? snapshot.enemies.reduce((prev, enemy) => (enemy.threatLevel > prev.threatLevel ? enemy : prev))
      : undefined;

    const highestThreatText = highestThreat
      ? `${highestThreat.id} (${highestThreat.threatLevel.toFixed(1)})`
      : "None";

    return `Active engagement units: ${engaged}/${snapshot.bots.length} | Suppressed hostiles: ${suppressed}/${snapshot.enemies.length} | Highest threat: ${highestThreatText}`;
  })();

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">SmartTeammates by Skyline</p>
          <h1>Adaptive Fireteam Command Console</h1>
        </div>
        <div className="summary">
          <span className="summary-label">Telemetry</span>
          <p>{tacticalSummary}</p>
        </div>
      </header>

      <main className="layout">
        <section className="panel options">
          <h2>Mod Options</h2>
          <div className="field">
            <label htmlFor="damage-slider">Damage Multiplier</label>
            <div className="slider-row">
              <input
                id="damage-slider"
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={options.damageMultiplier}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, damageMultiplier: Number(event.target.value) }))
                }
              />
              <span className="value">x{options.damageMultiplier.toFixed(1)}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="speed-select">Movement Speed</label>
            <select
              id="speed-select"
              value={options.movementSpeedPreset}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  movementSpeedPreset: event.target.value as MovementSpeedPreset
                }))
              }
            >
              {Object.entries(speedLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <p className="field-label">Command Routing</p>
            <div className="command-buttons">
              {(["hold", "regroup", "assault"] as CommandType[]).map((type) => (
                <button
                  key={type}
                  className={type === command ? "command-button active" : "command-button"}
                  onClick={() => handleCommandChange(type)}
                >
                  <span className="command-title">{type.toUpperCase()}</span>
                  <span className="command-description">{commandDescriptions[type]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel battlefield">
          <div className="panel-header">
            <h2>Battlefield Simulation</h2>
            <span className="panel-meta">Real-time AI positioning and targeting overlay</span>
          </div>
          <svg viewBox="0 0 100 70" className="battlefield-map">
            <defs>
              <radialGradient id="bot-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7bffb2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7bffb2" stopOpacity="0.2" />
              </radialGradient>
              <radialGradient id="enemy-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff7878" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ff7878" stopOpacity="0.2" />
              </radialGradient>
            </defs>

            {assaultMarker && (
              <circle cx={assaultMarker.x} cy={assaultMarker.y} r={4} className="assault-marker" />
            )}

            {(snapshot?.enemies ?? []).map((enemy) => (
              <g key={enemy.id} className="enemy">
                <circle cx={enemy.position.x} cy={enemy.position.y} r={3.4} fill="url(#enemy-gradient)" />
                <text x={enemy.position.x} y={enemy.position.y - 5} className="label">
                  {enemy.id}
                </text>
              </g>
            ))}

            {(snapshot?.bots ?? []).map((bot) => (
              <g key={bot.id} className="bot">
                <circle cx={bot.position.x} cy={bot.position.y} r={3.5} fill="url(#bot-gradient)" />
                <text x={bot.position.x} y={bot.position.y - 5} className="label bot-label">
                  {bot.name}
                </text>

                {bot.destination && (
                  <line
                    x1={bot.position.x}
                    y1={bot.position.y}
                    x2={bot.destination.x}
                    y2={bot.destination.y}
                    className="path"
                  />
                )}

                {bot.currentTargetId && (
                  (() => {
                    const target = enemies.find((enemy) => enemy.id === bot.currentTargetId);
                    if (!target) return null;
                    return (
                      <line
                        x1={bot.position.x}
                        y1={bot.position.y}
                        x2={target.position.x}
                        y2={target.position.y}
                        className="engagement"
                      />
                    );
                  })()
                )}
              </g>
            ))}

            {(snapshot?.bots ?? []).map((bot) => (
              <text key={`${bot.id}-state`} x={bot.position.x} y={bot.position.y + 6} className="status">
                {bot.state}
              </text>
            ))}
          </svg>
        </section>

        <section className="panel intel">
          <div className="panel-header">
            <h2>Operational Intel</h2>
            <span className="panel-meta">Bot telemetry & target status</span>
          </div>
          <div className="intel-grid">
            <div className="intel-column">
              <h3>Fireteam</h3>
              <ul className="list">
                {activeBots.map((bot) => (
                  <li key={bot.id} className="list-item">
                    <p className="list-title">
                      {bot.name}
                      <span className="role">{bot.role}</span>
                    </p>
                    <p className="list-subtitle">
                      State: {bot.state} | Health: {Math.round(bot.health)} | Speed x{bot.speedMultiplier.toFixed(2)}
                    </p>
                    <p className="list-meta">
                      Target: {bot.currentTargetId ?? "No target"} | Damage x{bot.damageMultiplier.toFixed(1)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="intel-column">
              <h3>Hostiles</h3>
              <ul className="list">
                {enemies.map((enemy) => (
                  <li key={enemy.id} className="list-item enemy-item">
                    <p className="list-title">
                      {enemy.id}
                      <span className={enemy.isSuppressed ? "suppressed" : "unsuppressed"}>
                        {enemy.isSuppressed ? "Suppressed" : "Active"}
                      </span>
                    </p>
                    <p className="list-subtitle">
                      Health: {Math.max(0, Math.round(enemy.health))} | Threat: {enemy.threatLevel.toFixed(1)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel log">
          <div className="panel-header">
            <h2>Command Log</h2>
            <span className="panel-meta">Real-time AI signal feed</span>
          </div>
          <ul className="log-list">
            {log.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
