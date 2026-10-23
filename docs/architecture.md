# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route-level React components responsible for presentation and user-visible loading, empty, success, and error states. Use the shared API client for relative `/api` requests; keep business rules and persistence out of the frontend.
- Logic tier decision: Keep `/api/*` routes thin and delegate behavior to explicit service functions. Validate request values and referenced records in services, return deliberate 4xx responses for invalid or unknown input, and leave unexpected failures to the shared error handler.
- Data tier decision: Put required fields, defaults, and reference types in the Mongoose schemas. Seed stable demo fixtures with upserts, preserving unrelated records and reconciling a demo user's previous team membership when reassigned.
- Activity tracking approach: Validate the user and team IDs and confirm both records exist before writing. Store the submitted user, team, type, and minutes, calculate points in the service, and set `occurredAt` on the server; reject invalid input without creating a record.
- Team management approach: Require a non-empty name and the schema-required mascot. Default members to an empty array, validate submitted member IDs against existing users, and keep team membership references consistent.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and return each team's name, total points, and 1-based rank.
- Workout suggestions approach: Resolve the user by email, use their fitness goal and recent activity to rank available workouts, and include a short reason for the leading recommendation. Return a deliberate 4xx when no user matches.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` checks schema requirements/defaults and seed idempotency/preservation. A failure points to model constraints or seed behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend` checks request validation, activity/team creation, leaderboard aggregation, and workout recommendations. A failure points to route/service behavior or response contracts, including invalid references returning 4xx rather than 5xx.
- Frontend command: `npm test --prefix octofit-tracker/frontend` checks API-backed rendering and accessible loading, empty, and error states. A failure points to presentation behavior or API-client integration.
- Backend build command: `npm run build --prefix octofit-tracker/backend` checks TypeScript compilation; a failure indicates backend type errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` checks TypeScript and Vite production compilation; a failure indicates frontend type or bundling errors.

Baseline observed before implementation: the backend suite had 8 failures and 1 pass (the seed contract passed); the frontend suite had 15 failures. Backend failures identify incomplete schema validation, stubbed activity/team services, an empty leaderboard, and workout suggestions without the expected reason. Frontend failures are consistent with route components still displaying “Implementation pending.” Re-run the focused data and API commands, then the frontend suite and both builds as implementation proceeds; do not treat the baseline failures as passing checks.
