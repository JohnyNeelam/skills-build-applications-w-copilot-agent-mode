import { CapabilityCard } from './CapabilityCard.js';

type Workout = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    collection="suggestions"
    emptyMessage="No workout suggestions yet."
  >
    {(suggestions) => <ul className="list-group">{suggestions.map((workout, index) => <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
      <div className="d-flex flex-wrap justify-content-between gap-2"><h3 className="h6 mb-0">{workout.title}</h3><span>{workout.focus} | {workout.minutes} min | {workout.difficulty}</span></div>
      <p className="mb-0 mt-2">{workout.reason}</p>
    </li>)}</ul>}
  </CapabilityCard>;
}
