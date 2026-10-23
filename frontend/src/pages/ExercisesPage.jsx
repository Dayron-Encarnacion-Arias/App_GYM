import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../services/exercise.service';
import ExerciseModal from '../components/ExerciseModal';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Layers,
  Repeat,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Core'];

const ExercisesPage = () => {
  const queryClient = useQueryClient();
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. useQuery para listar los ejercicios desde la API REST (Hexagonal Backend)
  const {
    data: exercisesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['exercises', { selectedMuscle, searchTerm }],
    queryFn: () =>
      exerciseService.getExercises({
        ...(selectedMuscle !== 'Todos' ? { muscleGroup: selectedMuscle } : {}),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      }),
  });

  const exercises = exercisesData?.data || [];

  // 2. useMutation para crear un ejercicio con invalidateQueries
  const createMutation = useMutation({
    mutationFn: (newExercise) => exerciseService.createExercise(newExercise),
    onSuccess: (res) => {
      // Invalida la consulta de ejercicios para actualizar la lista en tiempo real sin recargar la página
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsModalOpen(false);
      setActionSuccess(res.message || 'Ejercicio creado exitosamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al crear el ejercicio.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  // 3. useMutation para actualizar un ejercicio
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => exerciseService.updateExercise(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsModalOpen(false);
      setSelectedExercise(null);
      setActionSuccess(res.message || 'Ejercicio actualizado correctamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al actualizar el ejercicio.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  // 4. useMutation para eliminar un ejercicio
  const deleteMutation = useMutation({
    mutationFn: (id) => exerciseService.deleteExercise(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setActionSuccess(res.message || 'Ejercicio eliminado correctamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al eliminar el ejercicio.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  const handleOpenCreate = () => {
    setSelectedExercise(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el ejercicio '${name}'?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmitModal = (formData) => {
    if (selectedExercise && selectedExercise.id) {
      updateMutation.mutate({ id: selectedExercise.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'Principiante') return 'badge-info';
    if (diff === 'Intermedio') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Banco de Ejercicios (CRUD Completo)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
            Gestiona tu catálogo de movimientos con series, repeticiones y tiempos de descanso
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>Nuevo Ejercicio</span>
        </button>
      </div>

      {/* Alertas */}
      {actionSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Grupos musculares */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {muscleGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`btn btn-sm ${
                selectedMuscle === group ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="form-input"
            style={{ paddingLeft: '38px', paddingRight: '12px', height: '38px' }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
        </div>
      </div>

      {/* Grid de Ejercicios */}
      {isLoading ? (
        <div className="empty-state">
          <div className="nav-logo-badge" style={{ margin: '0 auto 16px' }}>
            <Dumbbell size={24} />
          </div>
          <p>Cargando banco de ejercicios...</p>
        </div>
      ) : isError ? (
        <div className="empty-state" style={{ color: '#f87171' }}>
          <AlertCircle size={36} />
          <p>Error al cargar ejercicios: {error?.message}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="card empty-state">
          <Dumbbell size={48} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            No se encontraron ejercicios
          </h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto 20px' }}>
            No hay ejercicios registrados con los filtros seleccionados. Crea uno nuevo para comenzar.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={18} />
            <span>Crear Ejercicio</span>
          </button>
        </div>
      ) : (
        <div className="exercises-grid">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                {/* Header de la tarjeta */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">{exercise.muscleGroup}</span>
                    <span className={`badge ${getDifficultyBadge(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                  </div>

                  {/* Acciones Editar / Eliminar */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEdit(exercise)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px' }}
                      title="Editar Ejercicio"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id, exercise.name)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px', color: '#f87171' }}
                      title="Eliminar Ejercicio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Nombre y descripción */}
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--text-main)',
                  }}
                >
                  {exercise.name}
                </h3>

                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                    lineHeight: '1.45',
                  }}
                >
                  {exercise.description || 'Sin descripción técnica registrada.'}
                </p>
              </div>

              {/* Parámetros: Series, Reps, Descanso */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: 'var(--bg-input)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginTop: 'auto',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Series
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {exercise.sets}
                  </div>
                </div>

                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Reps
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {exercise.reps}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Descanso
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa' }}>
                    {exercise.restSeconds}s
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear y Editar Ejercicio */}
      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExercise(null);
        }}
        onSubmit={handleSubmitModal}
        initialData={selectedExercise}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default ExercisesPage;
