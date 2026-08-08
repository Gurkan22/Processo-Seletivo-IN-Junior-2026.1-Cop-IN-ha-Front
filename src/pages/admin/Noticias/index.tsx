import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchLatestNews, deleteNewsRequest } from '../../../services/mockData';
import { AdminPage } from '../../../components/AdminPage';
import { Modal } from '../../../components/Modal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import type { News } from '../../../types';

export function AdminNoticias() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [illustrativeOpen, setIllustrativeOpen] = useState<null | 'create' | 'edit'>(null);
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);

  async function load() {
    setLoading(true);
    try {
      setNews(await fetchLatestNews());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return news;
    return news.filter((n) => n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q));
  }, [news, search]);

  return (
    <AdminPage title="Notícias">
      <div className="admin-page-action-row-between">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Buscar notícia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="admin-btn-primary" onClick={() => setIllustrativeOpen('create')}>
          <Plus size={16} strokeWidth={2.5} />
          Escrever Notícia
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty-state">Nenhuma notícia encontrada.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt=""
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: 'var(--color-border-soft)',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span style={{ fontWeight: 500 }}>{item.title}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{item.author}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-icon-btn"
                        title="Editar (ilustrativo)"
                        onClick={() => setIllustrativeOpen('edit')}
                      >
                        <Pencil size={15} strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn danger"
                        title="Excluir"
                        onClick={() => setDeleteTarget(item)}
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

      {illustrativeOpen && (
        <Modal
          title={illustrativeOpen === 'create' ? 'Escrever Notícia' : 'Editar Notícia'}
          onClose={() => setIllustrativeOpen(null)}
        >
          <p style={{ color: '#c3cede', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Essa ação é apenas ilustrativa nesta entrega.
          </p>
          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-ghost" onClick={() => setIllustrativeOpen(null)}>
              Entendi
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Excluir notícia"
          description={`Tem certeza que deseja excluir "${deleteTarget.title}"? Essa notícia deixará de aparecer no site.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteNewsRequest(deleteTarget.id);
            setDeleteTarget(null);
            await load();
          }}
        />
      )}
    </AdminPage>
  );
}
