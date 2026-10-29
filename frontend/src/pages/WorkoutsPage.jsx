import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutService } from '../services/workout.service';
import { Database, Plus, Save, X, Edit2, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const focusOptions = ['Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Core', 'Full Body', 'Cardio'];
const emptyForm = { name: '', focusMuscle: 'Full Body', durationMinutes: 60, description: '' };

const alertStyle = (ok) => ({
  background: ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
  border: `1px solid ${ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
  color: ok ? '#34d399' : '#f87171',
  padding: '12px 18px',
  borderRadius: 'var(--radius-sm)',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

/**
 * CRUD de rutinas guardadas en SQL Server (servicio de entrenamiento).
 */
const WorkoutsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const notify = (ok, text) => {
    setFeedback({ ok, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutService.getWorkouts(),
  });
  const workouts = data?.data || [];

  const onMutationSuccess = (res) => {
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
    setForm(emptyForm);
    setEditingId(null);
    notify(true, res.message || 'Operación realizada correctamente.');
  };
  const onMutationError = (err) => notify(false, err.response?.data?.message || 'No se pudo completar la operación.');

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? workoutService.updateWorkout(id, payload) : workoutService.createWorkout(payload)),
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workoutService.deleteWorkout(id),
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      id: editingId,
      payload: { ...form, durationMinutes: Number(form.durationMinutes) },
    });
  };

  const handleEdit = (workout) => {
    setEditingId(workout.id);
    setForm({
      name: workout.name,
      focusMuscle: workout.focusMuscle,
      durationMinutes: workout.durationMinutes,
      description: workout.description || '',
    });
  };

  const handleDelete = (workout) => {
    if (window.confirm(`¿Eliminar la rutina '${workout.name}'?`)) deleteMutation.mutate(workout.id);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Rutinas (SQL Server)</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
          Plantillas de entrenamiento guardadas en la tabla <code>dbo.Workouts</code> de SQL Server
        </p>
      </div>

      {feedback && (
        <div style={alertStyle(feedback.ok)} role="status">
          {feedback.ok ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px' }} aria-label="Formulario de rutina">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="workout-name">Nombre</label>
            <input id="workout-name" name="name" className="form-input" value={form.name} onChange={handleChange} required maxLength={100} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="workout-focus">Enfoque</label>
            <select id="workout-focus" name="focusMuscle" className="form-select" value={form.focusMuscle} onChange={handleChange}>
              {focusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="workout-duration">Duración (min)</label>
            <input id="workout-duration" name="durationMinutes" type="number" min={1} max={600} className="form-input" value={form.durationMinutes} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="workout-description">Descripción</label>
          <textarea id="workout-description" name="description" className="form-textarea" rows={2} maxLength={500} value={form.description} onChange={handleChange} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              <X size={16} />
              <span>Cancelar</span>
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            <span>{editingId ? 'Guardar cambios' : 'Crear rutina'}</span>
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="empty-state"><p>Cargando rutinas desde SQL Server...</p></div>
      ) : isError ? (
        <div className="empty-state" style={{ color: '#f87171' }}>
          <AlertCircle size={36} />
          <p>Error al cargar rutinas: {error?.response?.data?.message || error?.message}</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="card empty-state">
          <Database size={48} />
          <p>Aún no hay rutinas en SQL Server. Crea la primera con el formulario.</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {workouts.map((workout) => (
            <div key={workout.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-primary">{workout.focusMuscle}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(workout)} className="btn-ghost" style={{ padding: '6px', borderRadius: '6px' }} title="Editar rutina">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(workout)} className="btn-ghost" style={{ padding: '6px', borderRadius: '6px', color: '#f87171' }} title="Eliminar rutina">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{workout.name}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {workout.description || 'Sin descripción.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <Clock size={14} />
                <span>{workout.durationMinutes} min · #{workout.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;
