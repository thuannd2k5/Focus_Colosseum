import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { roomService } from '../services/roomService';
import { Room, RoomParticipant, RoomStatus, UserProfile } from '../types';

export const HEARTBEAT_TIMEOUT_MS = 15000;
export const HEARTBEAT_INTERVAL_MS = 5000;

interface UseRealtimeRoomOptions {
  roomId: string;
  currentUser: UserProfile | null;
  onSessionStart?: () => void;
  onRoomFailed?: (failedBy: { userId: string; displayName: string; reason?: string }) => void;
  onSessionComplete?: () => void;
  onParticipantDisconnected?: (participant: RoomParticipant) => void;
}

export const useRealtimeRoom = ({
  roomId,
  currentUser,
  onSessionStart,
  onRoomFailed,
  onSessionComplete,
  onParticipantDisconnected,
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
  const participantsRef = useRef<RoomParticipant[]>([]);
  participantsRef.current = participants;

  const onParticipantDisconnectedRef = useRef(onParticipantDisconnected);
  onParticipantDisconnectedRef.current = onParticipantDisconnected;

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

    const channelName = `room:${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentUser?.id || 'guest',
        },
      },
    });

    channelRef.current = channel;

    // Track presence sync
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

    // Track presence leave
    channel.on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
      if (leftPresences && Array.isArray(leftPresences)) {
        leftPresences.forEach((lp) => {
          const leftUserId = lp.userId;
          setParticipants((prev) =>
            prev.map((p) => {
              if (p.userId === leftUserId) {
                const disconnectedPeer = { ...p, status: 'disconnected' as const };
                if (onParticipantDisconnectedRef.current) {
                  onParticipantDisconnectedRef.current(disconnectedPeer);
                }
                return disconnectedPeer;
              }
              return p;
            })
          );
        });
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
          await channel.track({
            userId: currentUser.id,
            displayName: currentUser.displayName,
            status: 'ready',
            isFacedDown: false,
            lastHeartbeat: Date.now(),
          });
        }
      });

    // Heartbeat transmitter: Every 5s send our heartbeat
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
    }, HEARTBEAT_INTERVAL_MS);

    // Heartbeat monitor: Every 3s check if any peer has exceeded 15s timeout
    const monitorInterval = setInterval(() => {
      const now = Date.now();
      setParticipants((current) => {
        let changed = false;
        const updated = current.map((p) => {
          if (
            currentUser &&
            p.userId !== currentUser.id &&
            p.status !== 'disconnected' &&
            p.lastHeartbeat &&
            now - p.lastHeartbeat > HEARTBEAT_TIMEOUT_MS
          ) {
            changed = true;
            const timedOutPeer = { ...p, status: 'disconnected' as const };
            if (onParticipantDisconnectedRef.current) {
              onParticipantDisconnectedRef.current(timedOutPeer);
            }
            return timedOutPeer;
          }
          return p;
        });
        return changed ? updated : current;
      });
    }, 3000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(monitorInterval);
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
    if (onSessionStart) {
      onSessionStart();
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
    if (onRoomFailed) {
      onRoomFailed(payload);
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
    if (onSessionComplete) {
      onSessionComplete();
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
