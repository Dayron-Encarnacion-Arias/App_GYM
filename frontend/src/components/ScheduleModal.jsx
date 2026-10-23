import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Moon, Activity } from 'lucide-react';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const muscleFocusOptions = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Brazos',
  'Hombros',
  'Core',
  'Full Body',
  'Cardio',
  'Descanso',
];

const ScheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  availableExercises = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    dayOfWeek: 'Lunes',
    routineTitle: '',
    focusMuscle: 'Pecho',
    isRestDay: false,
    durationMinutes: 60,
    restIntervalSeconds: 60,
    targetExercises: [],
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        dayOfWeek: initialData.dayOfWeek || 'Lunes',
        routineTitle: initialData.routineTitle || '',
        focusMuscle: initialData.focusMuscle || 'Pecho',
        isRestDay: Boolean(initialData.isRestDay),
        durationMinutes: initialData.durationMinutes || 60,
        restIntervalSeconds: initialData.restIntervalSeconds || 60,
        targetExercises: initialData.targetExercises || [],
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        dayOfWeek: 'Lunes',
        routineTitle: '',
        focusMuscle: 'Pecho',
        isRestDay: false,
        durationMinutes: 60,
        restIntervalSeconds: 60,
        targetExercises: [],
        notes: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : ['durationMinutes', 'restIntervalSeconds'].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const toggleRestDay = (isRest) => {
    setFormData((prev) => ({
      ...prev,
      isRestDay: isRest,
      focusMuscle: isRest ? 'Descanso' : 'Pecho',
      routineTitle: isRest ? 'Día de Descanso y Recuperación' : prev.routineTitle,
      durationMinutes: isRest ? 0 : 60,
      targetExercises: isRest ? [] : prev.targetExercises,
    }));
  };

  const handleExerciseToggle = (exerciseName) => {
    setFormData((prev) => {
      const exists = prev.targetExercises.includes(exerciseName);
      return {
        ...prev,
        targetExercises: exists
          ? prev.targetExercises.filter((e) => e !== exerciseName)
          : [...prev.targetExercises, exerciseName],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.routineTitle.trim()) {
      setError('El título de la rutina es obligatorio');
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
              <Calendar size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {initialData ? 'Modificar Plan del Día' : 'Agendar Día de Gimnasio / Descanso'}
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

            {/* Selector de Tipo: Entrenamiento vs Descanso */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => toggleRestDay(false)}
                className={`btn ${!formData.isRestDay ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                <Activity size={18} />
                <span>Día de Entrenamiento</span>
              </button>

              <button
                type="button"
                onClick={() => toggleRestDay(true)}
                className={`btn ${formData.isRestDay ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  width: '100%',
                  background: formData.isRestDay ? 'linear-gradient(135deg, #a855f7, #7e22ce)' : '',
                }}
              >
                <Moon size={18} />
                <span>Día de Descanso</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Día de la Semana *</label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  className="form-select"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Enfoque Muscular</label>
                <select
                  name="focusMuscle"
                  value={formData.focusMuscle}
                  onChange={handleChange}
                  className="form-select"
                  disabled={formData.isRestDay}
                >
                  {muscleFocusOptions.map((focus) => (
                    <option key={focus} value={focus}>
                      {focus}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Título de la Rutina / Plan *</label>
              <input
                type="text"
                name="routineTitle"
                value={formData.routineTitle}
                onChange={handleChange}
                placeholder={formData.isRestDay ? 'Descanso activo, sueño reparador' : 'Ej. Hipertrofia Pecho & Tríceps'}
                className="form-input"
                required
              />
            </div>

            {!formData.isRestDay && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Duración Estimada (min)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      min="5"
                      max="300"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descanso entre Ejercicios (seg)</label>
                    <input
                      type="number"
                      name="restIntervalSeconds"
                      min="0"
                      max="300"
                      value={formData.restIntervalSeconds}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {availableExercises.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Seleccionar Ejercicios a Realizar</label>
                    <div
                      style={{
                        maxHeight: '130px',
                        overflowY: 'auto',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                      }}
                    >
                      {availableExercises.map((ex) => {
                        const checked = formData.targetExercises.includes(ex.name);
                        return (
                          <label
                            key={ex.id || ex._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              color: checked ? 'var(--primary)' : 'var(--text-muted)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleExerciseToggle(ex.name)}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>{ex.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notas / Instrucciones</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Pautas de hidratación, peso objetivo o descanso..."
                className="form-textarea"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Agendar al Calendario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
