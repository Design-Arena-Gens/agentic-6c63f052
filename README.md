# SmartTeammates by Skyline

SmartTeammates is a web-based command console that showcases a fully configurable AI teammate mod. Tweak combat modifiers in real-time, issue squad-level orders, and watch Skyline's autonomous fireteam coordinate cover fire, ability usage, and adaptive positioning on the simulated battlefield.

## Features

- **Damage Multiplier Slider** – Tune bot lethality from `x1.0` up to `x5.0` directly from the mod options panel.
- **Movement Speed Presets** – Switch between Standard, Fast, and Very Fast travel profiles to immediately alter squad mobility.
- **Advanced AI Brain** – Each bot evaluates threat, cover, and formation commands to prioritize targets, advance on objectives, and chain abilities such as shields, grenades, and nano-heals.
- **Command Routing** – Push Hold, Regroup, or Assault orders and observe how the bots adapt their destinations, support roles, and fire behaviour.
- **Live Telemetry** – Real-time SVG battlefield overlay, tactical readouts, and command log provide insight into the AI's decision-making pipeline.

## Getting Started

```bash
npm install
npm run dev
```

Then visit http://localhost:3000 to access the command console.

## Scripts

- `npm run dev` – Start the local development server.
- `npm run build` – Produce a production build ready for deployment.
- `npm run start` – Serve the production build locally.
- `npm run lint` – Run ESLint with the Next.js config.

## Deployment

This project is optimized for Vercel deployments. After building and testing locally, deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-6c63f052
```

Once the deployment completes, validate the production site:

```bash
curl https://agentic-6c63f052.vercel.app
```

## License

Released under the MIT License.
