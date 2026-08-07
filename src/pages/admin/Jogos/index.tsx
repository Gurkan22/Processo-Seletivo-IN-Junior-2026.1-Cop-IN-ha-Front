import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchMatches,
  fetchGroups,
  fetchStadiums,
  createMatchRequest,
  deleteMatchRequest,
} from '../../../services/mockData';
import { AdminPage } from '../../../components/AdminPage';
import { Modal } from '../../../components/Modal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import type { Group, Match, Stadium } from '../../../types';

function matchStatusLabel(match: Match): string {
  if (match.status !== 'finished' || match.homeScore == null || match.awayScore == null) {
    return 'Aguardando';
  }
  if (match.homeScore > match.awayScore) return 'Casa venceu';
  if (match.homeScore < match.awayScore) return 'Visitante venceu';
  return 'Empate';
}

export function AdminJogos() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [matchesData, groupsData] = await Promise.all([fetchMatches(), fetchGroups()]);
      setMatches(matchesData);
      setGroups(groupsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groupNameById = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups]);

  return (
    <AdminPage title="Jogos">
      <div className="admin-page-action-row">
        <button type="button" className="admin-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Novo jogo
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : matches.length === 0 ? (
        <p className="admin-empty-state">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Partida</th>
                <th>Placar</th>
                <th>Estádio</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => {
                const finished = match.status === 'finished' && match.homeScore != null && match.awayScore != null;
                return (
                  <tr key={match.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src={match.homeTeam.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />
                        <strong>{match.homeTeam.code}</strong>
                        <span style={{ color: 'var(--color-text-muted)' }}>vs</span>
                        <strong>{match.awayTeam.code}</strong>
                        <img src={match.awayTeam.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />
                        <span
                          style={{
                            color: 'var(--color-accent-yellow)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            marginLeft: '0.4rem',
                          }}
                        >
                          {groupNameById.get(match.groupId)?.toUpperCase() ?? ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      {finished ? (
                        <span style={{ color: 'var(--color-accent-yellow)', fontFamily: 'var(--font-display)' }}>
                          {match.homeScore} – {match.awayScore}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>Aguardando</span>
                      )}
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                        {matchStatusLabel(match)}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{match.stadium.name}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          title="Editar (ilustrativo)"
                          onClick={() => setEditTarget(match)}
                        >
                          <Pencil size={15} strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          title="Excluir"
                          onClick={() => setDeleteTarget(match)}
                        >
                          <Trash2 size={15} strokeWidth={2.25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreateMatchModal
          groups={groups}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await load();
          }}
        />
      )}

      {editTarget && (
        <Modal title="Editar jogo" onClose={() => setEditTarget(null)} width={400}>
          <p style={{ color: '#c3cede', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Essa ação é apenas ilustrativa nesta entrega, conforme o Documento de Requisitos do Front (lançar
            placar de verdade depende das rotas do back).
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-ghost" onClick={() => setEditTarget(null)}>
              Entendi
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Excluir jogo"
          description={`Tem certeza que deseja excluir a partida ${deleteTarget.homeTeam.code} vs ${deleteTarget.awayTeam.code}?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteMatchRequest(deleteTarget.id);
            setDeleteTarget(null);
            await load();
          }}
        />
      )}
    </AdminPage>
  );
}

interface CreateMatchModalProps {
  groups: Omit<Group, 'standings'>[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateMatchModal({ groups, onClose, onCreated }: CreateMatchModalProps) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [stadiumId, setStadiumId] = useState('');
  const [date, setDate] = useState('');
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStadiums().then((data) => {
      setStadiums(data);
      setStadiumId(data[0]?.id ?? '');
    });
  }, []);

  const selectedGroup = groups.find((g) => g.id === groupId);
  const groupTeams = selectedGroup?.teams ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!groupId || !homeTeamId || !awayTeamId || !stadiumId || !date) {
      setError('Preencha todos os campos.');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError('Os times da casa e visitante devem ser diferentes.');
      return;
    }

    setLoading(true);
    try {
      await createMatchRequest({
        groupId,
        homeTeamId,
        awayTeamId,
        stadiumId,
        date: new Date(date).toISOString(),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o jogo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Novo jogo" onClose={onClose} width={440}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="match-group">GRUPO</label>
          <select
            id="match-group"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setHomeTeamId('');
              setAwayTeamId('');
            }}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field-row">
          <div className="modal-field">
            <label htmlFor="match-home">TIME DA CASA</label>
            <select id="match-home" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
              <option value="">Selecione</option>
              {groupTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label htmlFor="match-away">TIME VISITANTE</label>
            <select id="match-away" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
              <option value="">Selecione</option>
              {groupTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor="match-stadium">ESTÁDIO</label>
          <select id="match-stadium" value={stadiumId} onChange={(e) => setStadiumId(e.target.value)}>
            {stadiums.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.city}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="match-date">DATA E HORA</label>
          <input id="match-date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {error && <div className="modal-form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar jogo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
