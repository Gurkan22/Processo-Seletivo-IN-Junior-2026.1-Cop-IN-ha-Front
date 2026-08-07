import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';
import { fetchGroups, fetchAllTeams, createGroupRequest, deleteGroupRequest } from '../../../services/mockData';
import { AdminPage } from '../../../components/AdminPage';
import { Modal } from '../../../components/Modal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import type { Group, Team } from '../../../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const MIN_TEAMS_PER_GROUP = 4;

export function AdminGrupos() {
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Omit<Group, 'standings'> | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [groupsData, teamsData] = await Promise.all([fetchGroups(), fetchAllTeams()]);
      setGroups(groupsData);
      setTeams(teamsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminPage title="Gerenciar Grupos">
      <div className="admin-page-action-row">
        <button type="button" className="admin-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Novo grupo
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : groups.length === 0 ? (
        <p className="admin-empty-state">Nenhum grupo cadastrado ainda.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Criado em</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                    {group.name.toUpperCase()}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {formatDate(group.createdAt)}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Excluir"
                        onClick={() => setDeleteTarget(group)}
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
        <CreateGroupModal
          teams={teams}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await load();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Excluir grupo"
          description={`Tem certeza que deseja excluir o "${deleteTarget.name}"? Os times ligados a ele continuarão cadastrados, mas ficarão sem grupo.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteGroupRequest(deleteTarget.id);
            setDeleteTarget(null);
            await load();
          }}
        />
      )}
    </AdminPage>
  );
}

interface CreateGroupModalProps {
  teams: Team[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateGroupModal({ teams, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTeam(id: string) {
    setSelectedTeamIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe o nome do grupo.');
      return;
    }
    if (selectedTeamIds.length < MIN_TEAMS_PER_GROUP) {
      setError(`Selecione pelo menos ${MIN_TEAMS_PER_GROUP} times para formar o grupo.`);
      return;
    }

    setLoading(true);
    try {
      await createGroupRequest({ name: name.trim(), teamIds: selectedTeamIds });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o grupo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Novo grupo" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="group-name">NOME DO GRUPO</label>
          <input
            id="group-name"
            type="text"
            placeholder="Ex: Grupo E"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>
            <Shield size={12} strokeWidth={2.25} style={{ display: 'inline', marginRight: 4 }} />
            TIMES DO GRUPO (mínimo {MIN_TEAMS_PER_GROUP})
          </label>
          <div className="modal-checkbox-list">
            {teams.map((team) => (
              <label key={team.id} className="modal-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedTeamIds.includes(team.id)}
                  onChange={() => toggleTeam(team.id)}
                />
                {team.name}
              </label>
            ))}
          </div>
        </div>

        {error && <div className="modal-form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="modal-btn modal-btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar grupo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
