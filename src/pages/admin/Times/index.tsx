import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchAllTeams,
  fetchGroups,
  fetchMatches,
  createTeamRequest,
  deleteTeamRequest,
} from '../../../services/mockData';
import { calculateGroupStandings } from '../../../services/standings';
import { AdminPage } from '../../../components/AdminPage';
import { Modal } from '../../../components/Modal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import type { GroupStanding, Group, Team } from '../../../types';

export function AdminTimes() {
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [teams, groupsData, matches] = await Promise.all([fetchAllTeams(), fetchGroups(), fetchMatches()]);
      setGroups(groupsData);
      setStandings(calculateGroupStandings(teams, matches));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groupNameById = new Map(groups.map((g) => [g.id, g.name]));

  return (
    <AdminPage title="Times">
      <div className="admin-page-action-row">
        <button type="button" className="admin-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Novo Time
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : standings.length === 0 ? (
        <p className="admin-empty-state">Nenhum time cadastrado ainda.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Seleção</th>
                <th>Grupo</th>
                <th style={{ textAlign: 'center' }}>V</th>
                <th style={{ textAlign: 'center' }}>E</th>
                <th style={{ textAlign: 'center' }}>D</th>
                <th style={{ textAlign: 'center' }}>PTS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {standings.map(({ team, wins, draws, losses, points }) => (
                <tr key={team.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={team.flagUrl}
                        alt=""
                        style={{ width: 22, height: 16, objectFit: 'cover', borderRadius: 2 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{team.name}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{team.code}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: 'var(--color-bg-card-header)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                      }}
                    >
                      {groupNameById.get(team.groupId) ?? '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{wins}</td>
                  <td style={{ textAlign: 'center' }}>{draws}</td>
                  <td style={{ textAlign: 'center' }}>{losses}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{points}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar (ilustrativo)"
                        onClick={() => setEditTarget(team)}
                      >
                        <Pencil size={15} strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Excluir"
                        onClick={() => setDeleteTarget(team)}
                      >
                        <Trash2 size={15} strokeWidth={2.25} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreateTeamModal
          groups={groups}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await load();
          }}
        />
      )}

      {editTarget && (
        <Modal title="Editar time" onClose={() => setEditTarget(null)} width={400}>
          <p style={{ color: '#c3cede', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Essa ação é apenas ilustrativa nesta entrega, conforme o Documento de Requisitos do Front.
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
          title="Excluir time"
          description={`Tem certeza que deseja excluir "${deleteTarget.name}"? Essa ação também some com o time dos grupos e listagens.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteTeamRequest(deleteTarget.id);
            setDeleteTarget(null);
            await load();
          }}
        />
      )}
    </AdminPage>
  );
}

interface CreateTeamModalProps {
  groups: Omit<Group, 'standings'>[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateTeamModal({ groups, onClose, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome da seleção.');
      return;
    }
    if (!/^[A-Za-z]{3}$/.test(code.trim())) {
      setError('A sigla deve ter exatamente 3 letras (ex: BRA).');
      return;
    }
    if (!groupId) {
      setError('Selecione um grupo.');
      return;
    }

    setLoading(true);
    try {
      await createTeamRequest({ name: name.trim(), code: code.trim(), groupId });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o time.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Novo time" onClose={onClose} width={420}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field-row">
          <div className="modal-field">
            <label htmlFor="team-name">NOME</label>
            <input id="team-name" type="text" placeholder="Ex: Portugal" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="modal-field">
            <label htmlFor="team-code">SIGLA</label>
            <input
              id="team-code"
              type="text"
              placeholder="POR"
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor="team-group">GRUPO</label>
          <select id="team-group" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="modal-form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar time'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
