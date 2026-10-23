import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    collection="leaderboard"
    emptyMessage="No leaderboard scores yet."
  >
    {(entries) => <div className="table-responsive"><table className="table align-middle mb-0">
      <thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col" className="text-end">Points</th></tr></thead>
      <tbody>{entries.map((entry) => <tr key={`${entry.rank}-${entry.teamName}`}>
        <th scope="row">{entry.rank}</th><td>{entry.teamName}</td><td className="text-end">{entry.totalPoints}</td>
      </tr>)}</tbody>
    </table></div>}
  </CapabilityCard>;
}
