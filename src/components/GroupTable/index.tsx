import type { Group } from '../../types';
import './groupTable.css';

interface GroupTableProps {
  group: Group;
}

export function GroupTable({ group }: GroupTableProps) {
  return (
    <div className="group-table">
      <div className="group-table-header">
        <span className="group-table-badge" aria-hidden />
        <span>{group.name.toUpperCase()}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Seleção</th>
            <th>J</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {group.standings.map((standing, index) => {
            const isLastQualified =
              standing.qualified && group.standings[index + 1] && !group.standings[index + 1].qualified;

            return (
              <tr key={standing.team.id} className={isLastQualified ? 'group-table-qualified-divider' : ''}>
                <td>{index + 1}</td>
                <td className="group-table-team-cell">
                  <img src={standing.team.flagUrl} alt={standing.team.name} />
                  <div>
                    <span className="group-table-team-name">{standing.team.name}</span>
                    <span className="group-table-team-code">{standing.team.code}</span>
                  </div>
                </td>
                <td>{standing.played}</td>
                <td>{standing.wins}</td>
                <td>{standing.draws}</td>
                <td>{standing.losses}</td>
                <td>{standing.goalsFor}</td>
                <td>{standing.goalsAgainst}</td>
                <td className={standing.goalDifference > 0 ? 'group-table-sg-positive' : standing.goalDifference < 0 ? 'group-table-sg-negative' : ''}>
                  {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                </td>
                <td className="group-table-points">{standing.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="group-table-legend">
        <span className="group-table-legend-marker" />
        Classificados para oitavas
      </div>
    </div>
  );
}
