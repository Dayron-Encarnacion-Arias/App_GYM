import React, { useState, useEffect } from 'react';
import { X, Dumbbell, AlertCircle } from 'lucide-react';

const muscleGroups = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Brazos',
  'Hombros',
  'Core',
  'Full Body',
  'Cardio',
];

const difficulties = ['Principiante', 'Intermedio', 'Avanzado'];

const ExerciseModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: 'Pecho',
    difficulty: 'Intermedio',
    sets: 3,
    reps: 10,
    restSeconds: 60,
    description: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        muscleGroup: initialData.muscleGroup || 'Pecho',
        difficulty: initialData.difficulty || 'Intermedio',
        sets: initialData.sets || 3,
        reps: initialData.reps || 10,
        restSeconds: initialData.restSeconds || 60,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        muscleGroup: 'Pecho',
        difficulty: 'Intermedio',
        sets: 3,
        reps: 10,
        restSeconds: 60,
        description: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['sets', 'reps', 'restSeconds'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre del ejercicio es obligatorio');
      return;
    }
    if (formData.sets < 1 || formData.sets > 50) {
      setError('Las series deben estar entre 1 y 50');
      return;
    }
    if (formData.reps < 1 || formData.reps > 500) {
      setError('Las repeticiones deben estar entre 1 y 500');
      return;
    }
    if (formData.restSeconds < 0 || formData.restSeconds > 600) {
      setError('El descanso debe estar entre 0 y 600 segundos');
      return;
    }

    setError('');
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="nav-logo-badge" style={{ width: '32px', height: '32px' }}>
              <Dumbbell size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {initialData ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nombre del Ejercicio *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Press Militar con Mancuernas"
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Grupo Muscular *</label>
                <select
                  name="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={handleChange}
                  className="form-select"
                >
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dificultad *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="form-select"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Series</label>
                <input
                  type="number"
                  name="sets"
                  min="1"
                  max="50"
                  value={formData.sets}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repeticiones</label>
                <input
                  type="number"
                  name="reps"
                  min="1"
                  max="500"
                  value={formData.reps}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descanso (seg)</label>
                <input
                  type="number"
                  name="restSeconds"
                  min="0"
                  max="600"
                  value={formData.restSeconds}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Técnica / Descripción (Opcional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalla postura, agarre o indicaciones para evitar lesiones..."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : initialData ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseModal;
