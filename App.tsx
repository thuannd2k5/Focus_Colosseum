import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreateJoinRoomScreen } from './src/screens/CreateJoinRoomScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { FocusSessionScreen } from './src/screens/FocusSessionScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { BannedModal } from './src/components/BannedModal';
import { useRealtimeRoom } from './src/hooks/useRealtimeRoom';
import { soundService } from './src/services/soundService';
import { authService } from './src/services/authService';
import { Room, UserProfile } from './src/types';

type ScreenName =
  | 'login'
  | 'register'
  | 'home'
  | 'create-join'
  | 'active-room'
  | 'admin';

interface SessionResultState {
  status: 'completed' | 'failed';
  durationMinutes: number;
  failedBy?: { userId: string; displayName: string; reason?: string };
}

interface ActiveRoomCoordinatorProps {
  room: Room;
  profile: UserProfile;
  onExit: () => void;
  onSessionSuccess: (minutes: number) => Promise<void>;
}

const ActiveRoomCoordinator: React.FC<ActiveRoomCoordinatorProps> = ({
  room,
  profile,
  onExit,
  onSessionSuccess,
}) => {
  const [roomScreen, setRoomScreen] = useState<'lobby' | 'session' | 'result'>('lobby');
  const [sessionResult, setSessionResult] = useState<SessionResultState | null>(null);

  const {
    participants,
    startSession,
  } = useRealtimeRoom({
    roomId: room.id,
    currentUser: profile,
    onSessionStart: () => {
      setRoomScreen('session');
    },
    onRoomFailed: (failed) => {
      soundService.playViolationAlarm();
      setSessionResult({
        status: 'failed',
        durationMinutes: room.durationMinutes,
        failedBy: failed,
      });
      setRoomScreen('result');
    },
    onSessionComplete: async () => {
      soundService.playSuccessFanfare();
      await onSessionSuccess(room.durationMinutes);
      setSessionResult({
        status: 'completed',
        durationMinutes: room.durationMinutes,
      });
      setRoomScreen('result');
    },
    onParticipantDisconnected: (disconnectedPeer) => {
      Alert.alert(
        'Thành viên mất kết nối!',
        `Chiến binh "${disconnectedPeer.displayName}" đã mất tín hiệu nhịp tim quá 15 giây.`
      );
    },
  });

  const displayedParticipants =
    participants.length > 0
      ? participants
      : [
          {
            roomId: room.id,
            userId: profile.id,
            displayName: profile.displayName,
            status: 'ready' as const,
            isFacedDown: false,
          },
        ];

  if (roomScreen === 'lobby') {
    return (
      <LobbyScreen
        room={room}
        participants={displayedParticipants}
        isHost={room.hostId === profile.id}
        onStartSession={startSession}
        onLeaveRoom={onExit}
      />
    );
  }

  if (roomScreen === 'session') {
    return (
      <FocusSessionScreen
        room={room}
        currentUser={profile}
        onSessionFinish={async (status, failedBy) => {
          if (status === 'completed') {
            await onSessionSuccess(room.durationMinutes);
          }
          setSessionResult({
            status,
            durationMinutes: room.durationMinutes,
            failedBy,
          });
          setRoomScreen('result');
        }}
      />
    );
  }

  return (
    <ResultScreen
      status={sessionResult?.status || 'completed'}
      durationMinutes={sessionResult?.durationMinutes || room.durationMinutes}
      failedBy={sessionResult?.failedBy}
      onBackHome={onExit}
    />
  );
};

const MainApp: React.FC = () => {
  const { profile, loading, isAuthenticated, isBanned, signIn, signUp, signOut, refreshProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const handleSessionSuccess = async (minutes: number) => {
    if (profile) {
      await authService.updateProfile(profile.id, {
        streak: profile.streak + 1,
        totalFocusMinutes: profile.totalFocusMinutes + minutes,
      });
      await refreshProfile();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#58A6FF" />
      </View>
    );
  }

  // Unauthenticated Flow
  if (!isAuthenticated || !profile) {
    if (currentScreen === 'register') {
      return (
        <View style={styles.container}>
          <RegisterScreen
            onRegister={async (email, password, displayName) => {
              const res = await signUp(email, password, displayName);
              if (res.success) {
                setCurrentScreen('home');
              } else {
                throw new Error(res.error);
              }
            }}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <LoginScreen
          onLogin={async (email, password) => {
            const res = await signIn(email, password);
            if (res.success) {
              setCurrentScreen('home');
            } else {
              throw new Error(res.error);
            }
          }}
          onGoToRegister={() => setCurrentScreen('register')}
        />
      </View>
    );
  }

  // Authenticated Screen Rendering
  return (
    <View style={styles.container}>
      {/* Non-dismissible Banned Modal if account status is banned */}
      <BannedModal
        visible={isBanned}
        onSignOut={async () => {
          await signOut();
          setCurrentScreen('login');
        }}
      />

      {currentScreen === 'home' && (
        <HomeScreen
          profile={profile}
          onNavigate={(screen) => {
            if (screen === 'create-join') setCurrentScreen('create-join');
            if (screen === 'admin') setCurrentScreen('admin');
          }}
          onSignOut={async () => {
            await signOut();
            setCurrentScreen('login');
          }}
        />
      )}

      {currentScreen === 'create-join' && (
        <CreateJoinRoomScreen
          profile={profile}
          onRoomReady={(room) => {
            setActiveRoom(room);
            setCurrentScreen('active-room');
          }}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'active-room' && activeRoom && (
        <ActiveRoomCoordinator
          room={activeRoom}
          profile={profile}
          onExit={() => {
            setActiveRoom(null);
            setCurrentScreen('home');
          }}
          onSessionSuccess={handleSessionSuccess}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminDashboardScreen
          onBack={() => setCurrentScreen('home')}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
