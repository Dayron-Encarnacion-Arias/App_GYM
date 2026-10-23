import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/schedule.service';
import { exerciseService } from '../services/exercise.service';
import ScheduleModal from '../components/ScheduleModal';
import {
  Calendar,
  Plus,
  Clock,
  Dumbbell,
  Moon,
  Trash2,
  Edit2,
  Flame,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SchedulesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filterRestOnly, setFilterRestOnly] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Obtener agendamientos usando TanStack React Query (useQuery)
  const {
    data: schedulesData,
    isLoading: isLoadingSchedules,
    isError: isErrorSchedules,
    error: errorSchedules,
  } = useQuery({
    queryKey: ['schedules', { filterRestOnly }],
    queryFn: () =>
      scheduleService.getSchedules(filterRestOnly ? { isRestDay: true } : {}),
  });

  // Obtener lista de ejercicios para el selector en el modal
  const { data: exercisesData } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getExercises(),
  });

  const schedules = schedulesData?.data || [];
  const exercises = exercisesData?.data || [];

  // 2. Creación con useMutation e invalidación automática de caché (invalidateQueries)
  const createMutation = useMutation({
    mutationFn: (newSchedule) => scheduleService.createSchedule(newSchedule),
    onSuccess: (res) => {
      // Invalida la consulta de react-query para refrescar sin recargar la página
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setIsModalOpen(false);
      setActionSuccess(res.message || 'Día agendado exitosamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al agendar el día.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  // Mutación para actualizar agendamiento
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => scheduleService.updateSchedule(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setIsModalOpen(false);
      setSelectedSchedule(null);
      setActionSuccess(res.message || 'Agendamiento actualizado correctamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al actualizar el agendamiento.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  // Mutación para eliminar agendamiento
  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleService.deleteSchedule(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setActionSuccess(res.message || 'Agendamiento eliminado correctamente.');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al eliminar el agendamiento.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    },
  });

  const handleOpenCreate = (dayPreset = null) => {
    setSelectedSchedule(dayPreset ? { dayOfWeek: dayPreset } : null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la rutina '${title}'?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmitModal = (formData) => {
    if (selectedSchedule && selectedSchedule.id) {
      updateMutation.mutate({ id: selectedSchedule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Agrupar rutinas por día de la semana
  const getSchedulesForDay = (day) => {
    return schedules.filter((s) => s.dayOfWeek === day);
  };

  const totalWorkouts = schedules.filter((s) => !s.isRestDay).length;
  const totalRestDays = schedules.filter((s) => s.isRestDay).length;

  return (
    <div className="main-content">
      {/* Header & Actions */}
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
            Planificador Semanal de Gimnasio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: '4px' }}>
            Organiza tus días de entrenamiento, descansos programados y ejercicios asignados
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setFilterRestOnly(!filterRestOnly)}
            className={`btn ${filterRestOnly ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Moon size={16} />
            <span>{filterRestOnly ? 'Ver Todos los Días' : 'Solo Días de Descanso'}</span>
          </button>

          <button onClick={() => handleOpenCreate()} className="btn btn-primary">
            <Plus size={18} />
            <span>Agendar Día de Gym</span>
          </button>
        </div>
      </div>

      {/* Alertas de éxito o error */}
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

      {/* Estadísticas de la semana */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '28px',
        }}
      >
        <div className="stat-chip">
          <Flame size={16} style={{ color: 'var(--primary)' }} />
          <span>Días de Entrenamiento: <strong>{totalWorkouts}</strong></span>
        </div>
        <div className="stat-chip">
          <Moon size={16} style={{ color: '#c084fc' }} />
          <span>Días de Descanso: <strong>{totalRestDays}</strong></span>
        </div>
        <div className="stat-chip">
          <Dumbbell size={16} style={{ color: 'var(--accent)' }} />
          <span>Ejercicios Disponibles: <strong>{exercises.length}</strong></span>
        </div>
      </div>

      {/* Visualización de la Semana (7 Días) */}
      {isLoadingSchedules ? (
        <div className="empty-state">
          <div className="nav-logo-badge" style={{ margin: '0 auto 16px' }}>
            <Calendar size={24} />
          </div>
          <p>Cargando agendamientos semanales...</p>
        </div>
      ) : isErrorSchedules ? (
        <div className="empty-state" style={{ color: '#f87171' }}>
          <AlertCircle size={36} />
          <p>Error al cargar el calendario: {errorSchedules?.message}</p>
        </div>
      ) : (
        <div className="grid-cols-7">
          {daysOfWeek.map((day) => {
            const daySchedules = getSchedulesForDay(day);

            return (
              <div
                key={day}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '280px',
                  borderTop:
                    daySchedules.some((s) => s.isRestDay)
                      ? '3px solid #a855f7'
                      : daySchedules.length > 0
                      ? '3px solid var(--primary)'
                      : '3px solid var(--border)',
                }}
              >
                {/* Header del día */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>{day}</span>
                  <button
                    onClick={() => handleOpenCreate(day)}
                    className="btn-ghost"
                    style={{ padding: '4px', borderRadius: '4px' }}
                    title={`Agendar para el ${day}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Rutinas agendadas en el día */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {daySchedules.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      Sin rutina agendada
                    </div>
                  ) : (
                    daySchedules.map((schedule) => (
                      <div
                        key={schedule.id || schedule._id}
                        style={{
                          background: schedule.isRestDay
                            ? 'rgba(168, 85, 247, 0.08)'
                            : 'var(--bg-input)',
                          border: `1px solid ${
                            schedule.isRestDay
                              ? 'rgba(168, 85, 247, 0.3)'
                              : 'var(--border)'
                          }`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '6px',
                          }}
                        >
                          <span
                            className={`badge ${
                              schedule.isRestDay ? 'badge-rest' : 'badge-primary'
                            }`}
                          >
                            {schedule.isRestDay ? 'Descanso' : schedule.focusMuscle}
                          </span>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenEdit(schedule)}
                              className="btn-ghost"
                              style={{ padding: '3px' }}
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(schedule.id || schedule._id, schedule.routineTitle)
                              }
                              className="btn-ghost"
                              style={{ padding: '3px', color: '#f87171' }}
                              title="Eliminar"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {schedule.routineTitle}
                        </div>

                        {!schedule.isRestDay && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--text-dim)',
                            }}
                          >
                            <Clock size={13} />
                            <span>{schedule.durationMinutes} min • Descanso: {schedule.restIntervalSeconds}s</span>
                          </div>
                        )}

                        {schedule.targetExercises && schedule.targetExercises.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                                marginBottom: '4px',
                              }}
                            >
                              Ejercicios:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {schedule.targetExercises.map((exName, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {exName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {schedule.notes && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-dim)',
                              fontStyle: 'italic',
                              marginTop: '2px',
                            }}
                          >
                            "{schedule.notes}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear / Editar Agendamiento */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSchedule(null);
        }}
        onSubmit={handleSubmitModal}
        initialData={selectedSchedule}
        availableExercises={exercises}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default SchedulesPage;
