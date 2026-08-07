import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchStadiums, deleteStadiumRequest } from '../../../services/mockData';
import { AdminPage } from '../../../components/AdminPage';
import { Modal } from '../../../components/Modal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import type { Stadium } from '../../../types';

export function AdminEstadios() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Stadium | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stadium | null>(null);

  async function load() {
    setLoading(true);
    try {
      setStadiums(await fetchStadiums());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminPage title="Estádios">
      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : stadiums.length === 0 ? (
        <p className="admin-empty-state">Nenhum estádio cadastrado ainda.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Estádio</th>
                <th>Cidade</th>
                <th>Capacidade</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stadiums.map((stadium) => (
                <tr key={stadium.id}>
                  <td style={{ fontWeight: 600 }}>{stadium.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{stadium.city}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {stadium.capacity.toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar (ilustrativo)"
                        onClick={() => setEditTarget(stadium)}
                      >
                        <Pencil size={15} strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Excluir"
                        onClick={() => setDeleteTarget(stadium)}
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

      {editTarget && (
        <Modal title="Editar estádio" onClose={() => setEditTarget(null)} width={400}>
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
          title="Excluir estádio"
          description={`Tem certeza que deseja excluir "${deleteTarget.name}"?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteStadiumRequest(deleteTarget.id);
            setDeleteTarget(null);
            await load();
          }}
        />
      )}
    </AdminPage>
  );
}
