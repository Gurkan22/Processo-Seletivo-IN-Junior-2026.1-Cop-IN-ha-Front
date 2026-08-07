import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../Modal';

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({ title, description, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.');
      setLoading(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel} width={400}>
      <p style={{ color: '#c3cede', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
        {description}
      </p>
      {error && <div className="modal-form-error" style={{ marginTop: '1rem' }}>{error}</div>}
      <div className="modal-actions">
        <button type="button" className="modal-btn modal-btn-ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="modal-btn modal-btn-danger" onClick={handleConfirm} disabled={loading}>
          <Trash2 size={15} strokeWidth={2.25} />
          {loading ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </Modal>
  );
}
