import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { roomService } from '../services/roomService';
import { Room, RoomParticipant, RoomStatus, UserProfile } from '../types';

interface UseRealtimeRoomOptions {
  roomId: string;
  currentUser: UserProfile | null;
  onSessionStart?: () => void;
  onRoomFailed?: (failedBy: { userId: string; displayName: string; reason?: string }) => void;
  onSessionComplete?: () => void;
}

export const useRealtimeRoom = ({
  roomId,
  currentUser,
  onSessionStart,
  onRoomFailed,
  onSessionComplete,
}: UseRealtimeRoomOptions) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [failedMember, setFailedMember] = useState<{
    userId: string;
    displayName: string;
    reason?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const channelRef = useRef<any>(null);

  const refreshRoomAndParticipants = useCallback(async () => {
    if (!roomId) return;
    const fetchedRoom = await roomService.getRoom(roomId);
    if (fetchedRoom) {
      setRoom(fetchedRoom);
      setRoomStatus(fetchedRoom.status);
    }
    const fetchedParticipants = await roomService.getParticipants(roomId);
    if (fetchedParticipants.length > 0) {
      setParticipants(fetchedParticipants);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    refreshRoomAndParticipants();

    // Subscribe to Supabase Realtime channel for room presence and broadcast
    const channelName = `room:${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser?.id || 'guest',
        },
      },
    });

    channelRef.current = channel;

    // Track presence
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const updatedList: RoomParticipant[] = [];

      Object.keys(presenceState).forEach((key) => {
        const presences = presenceState[key] as any[];
        if (presences && presences.length > 0) {
          const p = presences[0];
          updatedList.push({
            roomId,
            userId: p.userId || key,
            displayName: p.displayName || 'Chiến binh',
            status: p.status || 'ready',
            isFacedDown: Boolean(p.isFacedDown),
            lastHeartbeat: p.lastHeartbeat || Date.now(),
          });
        }
      });

      if (updatedList.length > 0) {
        setParticipants(updatedList);
      }
    });

    // Listen to broadcast events
    channel
      .on('broadcast', { event: 'SESSION_START' }, () => {
        setRoomStatus('active');
        if (onSessionStart) onSessionStart();
      })
      .on('broadcast', { event: 'MEMBER_FAILED' }, ({ payload }) => {
        setRoomStatus('failed');
        setFailedMember(payload);
        if (onRoomFailed) onRoomFailed(payload);
      })
      .on('broadcast', { event: 'SESSION_COMPLETED' }, () => {
        setRoomStatus('completed');
        if (onSessionComplete) onSessionComplete();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUser) {
          // Track current user presence
          await channel.track({
            userId: currentUser.id,
            displayName: currentUser.displayName,
            status: 'ready',
            isFacedDown: false,
            lastHeartbeat: Date.now(),
          });
        }
      });

    // Heartbeat ticker: every 5 seconds send presence update
    const heartbeatInterval = setInterval(() => {
      if (channel && currentUser) {
        channel.track({
          userId: currentUser.id,
          displayName: currentUser.displayName,
          status: roomStatus === 'active' ? 'focusing' : 'ready',
          isFacedDown: false,
          lastHeartbeat: Date.now(),
        }).catch(() => {});
      }
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      channel.unsubscribe();
    };
  }, [roomId, currentUser, onSessionStart, onRoomFailed, onSessionComplete, refreshRoomAndParticipants, roomStatus]);

  const startSession = async () => {
    await roomService.updateRoomStatus(roomId, 'active');
    setRoomStatus('active');
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'SESSION_START',
        payload: { startedAt: new Date().toISOString() },
      });
    }
  };

  const notifyViolation = async (reason = 'Lật điện thoại hoặc rời ứng dụng quá thời gian ân hạn') => {
    if (!currentUser) return;
    const payload = {
      userId: currentUser.id,
      displayName: currentUser.displayName,
      reason,
    };
    await roomService.updateRoomStatus(roomId, 'failed');
    setRoomStatus('failed');
    setFailedMember(payload);

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'MEMBER_FAILED',
        payload,
      });
    }
  };

  const notifyFaceDown = async (isFacedDown: boolean) => {
    if (channelRef.current && currentUser) {
      await channelRef.current.track({
        userId: currentUser.id,
        displayName: currentUser.displayName,
        status: 'focusing',
        isFacedDown,
        lastHeartbeat: Date.now(),
      });
    }
  };

  const completeSession = async () => {
    await roomService.updateRoomStatus(roomId, 'completed');
    setRoomStatus('completed');
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'SESSION_COMPLETED',
        payload: { completedAt: new Date().toISOString() },
      });
    }
  };

  return {
    room,
    participants,
    roomStatus,
    failedMember,
    loading,
    startSession,
    notifyViolation,
    notifyFaceDown,
    completeSession,
    refreshRoomAndParticipants,
  };
};
