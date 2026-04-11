import React, { useEffect, useState, useRef } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

export default function SharedWhiteboard({ roomId, socket }) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    // Request full state when joining
    socket.emit('whiteboard_sync_request', { roomId });

    const handleSyncRequest = ({ from }) => {
      const snapshot = store.serialize();
      socket.emit('whiteboard_sync_response', { to: from, state: snapshot, roomId });
    };

    const handleSyncResponse = ({ state }) => {
      isUpdatingRef.current = true;
      try {
        store.deserialize(state);
      } catch (err) {
        console.error("TLDraw deserialize error", err);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    const handleUpdate = (payload) => {
      if (!store) return;
      isUpdatingRef.current = true;
      try {
        const elements = Array.isArray(payload) ? payload : payload.elements;
        const removedIds = !Array.isArray(payload) && payload.removed ? payload.removed : [];
        
        store.mergeRemoteChanges(() => {
          if (elements && elements.length > 0) store.put(elements);
          if (removedIds && removedIds.length > 0) store.remove(removedIds);
        });
      } catch (err) {
        console.error("TLDraw merge diff error", err);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    socket.on('whiteboard_update', handleUpdate);
    socket.on('whiteboard_sync_request', handleSyncRequest);
    socket.on('whiteboard_sync_response', handleSyncResponse);

    return () => {
      socket.off('whiteboard_update', handleUpdate);
      socket.off('whiteboard_sync_request', handleSyncRequest);
      socket.off('whiteboard_sync_response', handleSyncResponse);
    }
  }, [socket, store, roomId]);

  useEffect(() => {
    if (!store || !socket) return;
    let timeout = null;
    const unsub = store.listen((update) => {
      if (isUpdatingRef.current) return;
      const changes = { ...update.changes.added, ...update.changes.updated };
      const records = Object.values(changes);
      const removedIds = Object.keys(update.changes.removed);
      
      if (records.length > 0 || removedIds.length > 0) {
        socket.emit('whiteboard_update', { roomId, elements: records, removed: removedIds });

        // Debounced full state save for persistence (after inactivity)
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const fullState = store.serialize();
          socket.emit('whiteboard_update', { roomId, fullState });
        }, 3000);
      }
    }, { source: 'user', scope: 'document' });
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [store, roomId, socket]);

  const handleMount = (editor) => {
    editor.setCameraOptions({ wheelBehavior: 'pan' });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Tldraw store={store} theme="dark" onMount={handleMount} />
    </div>
  );
}
