import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot: string; members?: string[] };

export default function Teams() {
  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    collection="teams"
    emptyMessage="No teams yet."
  >
    {(teams) => <ul className="list-group">{teams.map((team, index) => <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
      <h3 className="h6 mb-1">{team.name}</h3><p className="mb-0">Mascot: {team.mascot}, {(team.members ?? []).length} members</p>
    </li>)}</ul>}
  </CapabilityCard>;
}
