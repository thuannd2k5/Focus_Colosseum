import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import { Room } from './src/types';

type ScreenName =
  | 'login'
  | 'register'
  | 'home'
  | 'create-join'
  | 'lobby'
  | 'focus-session'
  | 'result'
  | 'admin';

interface SessionResultState {
  status: 'completed' | 'failed';
  durationMinutes: number;
  failedBy?: { userId: string; displayName: string; reason?: string };
}

const MainApp: React.FC = () => {
  const { profile, loading, isAuthenticated, isBanned, signIn, signUp, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResultState | null>(null);

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
            setCurrentScreen('lobby');
          }}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'lobby' && activeRoom && (
        <LobbyScreen
          room={activeRoom}
          participants={[
            {
              roomId: activeRoom.id,
              userId: profile.id,
              displayName: profile.displayName,
              status: 'ready',
              isFacedDown: false,
            },
          ]}
          isHost={activeRoom.hostId === profile.id}
          onStartSession={() => setCurrentScreen('focus-session')}
          onLeaveRoom={() => {
            setActiveRoom(null);
            setCurrentScreen('home');
          }}
        />
      )}

      {currentScreen === 'focus-session' && activeRoom && (
        <FocusSessionScreen
          room={activeRoom}
          currentUser={profile}
          onSessionFinish={(status, failedBy) => {
            setSessionResult({
              status,
              durationMinutes: activeRoom.durationMinutes,
              failedBy,
            });
            setCurrentScreen('result');
          }}
        />
      )}

      {currentScreen === 'result' && sessionResult && (
        <ResultScreen
          status={sessionResult.status}
          durationMinutes={sessionResult.durationMinutes}
          failedBy={sessionResult.failedBy}
          onBackHome={() => {
            setActiveRoom(null);
            setSessionResult(null);
            setCurrentScreen('home');
          }}
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
