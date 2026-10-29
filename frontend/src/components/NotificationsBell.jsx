import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notification.service';

/**
 * Campana con los avisos del servicio de notificaciones. La bienvenida llega por
 * el evento usuario.creado de RabbitMQ, así que se consulta periódicamente.
 */
const NotificationsBell = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    refetchInterval: 15000,
  });
  const notifications = data?.data || [];
  const unread = data?.unread || 0;

  const markAsRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notificaciones (${unread} sin leer)`}
        title="Notificaciones"
        style={{ position: 'relative' }}
      >
        <Bell size={19} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              display: 'grid',
              placeItems: 'center',
              padding: '0 4px',
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          role="dialog"
          aria-label="Lista de notificaciones"
          style={{
            position: 'absolute',
            right: 0,
            top: '44px',
            width: 'min(320px, 85vw)',
            zIndex: 50,
            padding: '12px',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.86rem' }}>No tienes notificaciones.</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                className="btn-ghost"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  opacity: notification.read ? 0.6 : 1,
                  borderLeft: notification.read ? '3px solid transparent' : '3px solid var(--primary)',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{notification.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{notification.message}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
