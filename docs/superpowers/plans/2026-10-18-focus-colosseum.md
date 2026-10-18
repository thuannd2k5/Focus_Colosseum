# Focus Colosseum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng di động Focus Colosseum (React Native / Expo + TypeScript) hỗ trợ tập trung nhóm nhỏ 2–6 người với cảm biến phát hiện úp máy, đồng bộ thời gian thực qua Supabase Realtime, và hệ thống phân quyền Admin có khả năng khóa/mở khóa tài khoản.

**Architecture:** Kiến trúc Client-First với React Native (Expo managed), phân tách rõ ràng UI components, custom hooks (`useSensors`, `useRealtimeRoom`, `useAuth`), và tầng service Supabase. Dùng Supabase Auth cho xác thực, Supabase Realtime Presence để đồng bộ phòng và heartbeat, `expo-sensors` để đọc cảm biến gia tốc, `expo-keep-awake` để duy trì tiến trình đo khi úp máy.

**Tech Stack:** React Native, Expo SDK, TypeScript (strict), `@supabase/supabase-js`, `expo-sensors`, `expo-keep-awake`, `expo-haptics`, `expo-av`, Jest, `@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-10-18-focus-colosseum-design.md`

## Global Constraints

- **Language & Runtime:** TypeScript strictly typed (`strict: true` in `tsconfig.json`). No implicit `any`.
- **Framework:** Expo Managed Workflow (tương thích chạy trên Android Studio Emulator và thiết bị Android thật).
- **Backend:** Supabase Auth & Supabase Database/Realtime.
- **Hardware sensors:** `expo-sensors` (Accelerometer Z-axis $\approx -1.0 \pm 0.2$), `AppState` lifecycle listener.
- **Screen handling:** `expo-keep-awake` enabled during active session; display OLED pure black (#000000) when face-down.
- **Grace period:** 10-second timer when phone is lifted or app is blurred before triggering session failure.
- **Permissions & Roles:** `role: 'user' | 'admin'`, `status: 'active' | 'banned'`. Banned users are denied room creation and room joining.

## Review Focus

1. **Banned user tries to join an active room via direct PIN code:** The join operation must immediately fail with an explicit alert and leave the room state untouched.
2. **Device transient jitter / slight table bump:** Accelerometer readings fluctuating outside $\pm 0.2$ for less than 10 seconds must not abort the session (grace period cancels on flip-down recovery).
3. **App backgrounded (user presses Home button):** `AppState` immediately flags violation and starts the 10-second grace countdown with haptic feedback.
4. **Network disconnection during session:** If a client loses connection, Supabase Presence heartbeat marks disconnected after 15 seconds, alerting remaining participants.
5. **Session completion:** When timer reaches 00:00 with no unrecovered violations, session status transitions to `completed`, streak increments, and victory screen displays.

---

### Task 1: Project Scaffolding & Directory Architecture

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `app.json`
- Create: `src/types/index.ts`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js, npm, Expo CLI
- Produces: Base project structure, TypeScript configuration, core domain types (`UserProfile`, `Room`, `RoomParticipant`, `SessionLog`)

- [ ] **Step 1: Write the failing setup test**

```typescript
// tests/setup.test.ts
describe('Project Environment Setup', () => {
  it('should have valid typescript configuration and environment', () => {
    const tsconfig = require('../tsconfig.json');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/setup.test.ts`  
Expected: FAIL (cannot find `tsconfig.json` or jest runner)

- [ ] **Step 3: Initialize Expo TypeScript project scaffolding**

Scaffold standard Expo React Native project with TypeScript configuration, create directory structure (`src/components`, `src/screens`, `src/hooks`, `src/services`, `src/types`), and install dependencies (`@supabase/supabase-js`, `expo-sensors`, `expo-keep-awake`, `expo-haptics`, `expo-av`).

- [ ] **Step 4: Define domain TypeScript interfaces in `src/types/index.ts`**

Define `UserProfile` (id, email, displayName, role, status, streak, totalMinutes), `Room` (id, code, hostId, durationMinutes, status), `RoomParticipant` (roomId, userId, displayName, status, isFacedDown), and `SessionResult`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest tests/setup.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json app.json src/ tests/
git commit -m "chore: scaffold project structure and core types"
```

---

### Task 2: Supabase Client & Authentication Service

**Files:**
- Create: `src/services/supabase.ts`
- Create: `src/services/authService.ts`
- Create: `src/hooks/useAuth.tsx`
- Test: `tests/services/authService.test.ts`

**Interfaces:**
- Consumes: `src/types/index.ts` (`UserProfile`)
- Produces: `authService.signUp`, `authService.signIn`, `authService.signOut`, `authService.getProfile`, `useAuth()` hook providing `user`, `profile`, `isAdmin`, `isBanned`

- [ ] **Step 1: Write failing tests for Auth service and ban checking**

```typescript
// tests/services/authService.test.ts
import { isUserBanned } from '../../src/services/authService';
import { UserProfile } from '../../src/types';

describe('authService.isUserBanned', () => {
  it('should return true if user status is banned', () => {
    const bannedUser: UserProfile = {
      id: '1',
      email: 'banned@test.com',
      displayName: 'BadActor',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    };
    expect(isUserBanned(bannedUser)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/services/authService.test.ts`  
Expected: FAIL (cannot resolve `authService`)

- [ ] **Step 3: Implement Supabase client & Auth service**

Implement `src/services/supabase.ts` initialization with mock/fallback environment configs, `src/services/authService.ts` with profile retrieval, role resolution, and `isUserBanned` helper.

- [ ] **Step 4: Implement `useAuth` React Context Provider**

Create `src/hooks/useAuth.tsx` managing user session, automatic profile sync, and exposed flags (`isAuthenticated`, `isAdmin`, `isBanned`).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/services/authService.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/services/ src/hooks/useAuth.tsx tests/services/
git commit -m "feat: implement auth service, profile management and useAuth hook"
```

---

### Task 3: Authentication & Authorization Screens

**Files:**
- Create: `src/screens/LoginScreen.tsx`
- Create: `src/screens/RegisterScreen.tsx`
- Create: `src/components/BannedModal.tsx`
- Test: `tests/screens/AuthScreens.test.tsx`

**Interfaces:**
- Consumes: `useAuth` hook, `authService`
- Produces: Visual login, registration screens, and a non-dismissible `BannedModal` alert when account status is `banned`

- [ ] **Step 1: Write failing component tests for Login & Banned states**

```typescript
// tests/screens/AuthScreens.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { BannedModal } from '../../src/components/BannedModal';

describe('BannedModal', () => {
  it('should display ban notification when visible', () => {
    const { getByText } = render(<BannedModal visible={true} onSignOut={jest.fn()} />);
    expect(getByText(/tài khoản của bạn đã bị khóa/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/AuthScreens.test.tsx`  
Expected: FAIL (cannot resolve `BannedModal`)

- [ ] **Step 3: Implement `BannedModal`, `LoginScreen`, and `RegisterScreen`**

Design responsive dark-themed auth forms with validation for email and password. Implement `BannedModal` that prevents interaction and offers only a Sign Out button.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/screens/AuthScreens.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/screens/LoginScreen.tsx src/screens/RegisterScreen.tsx src/components/BannedModal.tsx tests/screens/
git commit -m "feat: add login, register screens and banned modal"
```

---

### Task 4: Hardware Sensors & Screen Management (Orientation & Lifecycle)

**Files:**
- Create: `src/hooks/useSensors.ts`
- Create: `src/services/soundService.ts`
- Create: `src/components/ZenScreen.tsx`
- Test: `tests/hooks/useSensors.test.ts`

**Interfaces:**
- Consumes: `expo-sensors` (Accelerometer), `AppState`, `expo-keep-awake`, `expo-haptics`, `expo-av`
- Produces: `useSensors({ onViolation, onRecover }) -> { isFacedDown, isInGracePeriod, graceSecondsLeft, activateSensors, deactivateSensors }`

- [ ] **Step 1: Write unit tests for sensor orientation calculations and grace timer logic**

```typescript
// tests/hooks/useSensors.test.ts
import { isOrientationFacedDown } from '../../src/hooks/useSensors';

describe('useSensors: isOrientationFacedDown', () => {
  it('should identify face down when Z axis is near -1.0', () => {
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -0.95 })).toBe(true);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -0.85 })).toBe(true);
  });

  it('should identify not face down when phone is flat screen up', () => {
    expect(isOrientationFacedDown({ x: 0, y: 0, z: 1.0 })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/hooks/useSensors.test.ts`  
Expected: FAIL (cannot resolve `isOrientationFacedDown`)

- [ ] **Step 3: Implement `useSensors` hook with 10-second grace countdown**

Implement `isOrientationFacedDown(data)` helper with tolerance $Z \in [-1.2, -0.8]$. Integrate `AppState.addEventListener` to capture background transitions. Start 10s countdown upon violation, invoke haptic buzz via `expo-haptics`, and trigger `onViolation()` only if grace period expires without recovery.

- [ ] **Step 4: Implement `ZenScreen` and `soundService`**

Build `ZenScreen` displaying OLED pure black (#000000) with ultra-minimal dim clock. Build `soundService` to play alert buzz / horn using `expo-av` and `expo-haptics`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/hooks/useSensors.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useSensors.ts src/services/soundService.ts src/components/ZenScreen.tsx tests/hooks/
git commit -m "feat: implement hardware sensor detection, 10s grace period and Zen screen"
```

---

### Task 5: Realtime Room Sync & Strict Survival Arbitration

**Files:**
- Create: `src/services/roomService.ts`
- Create: `src/hooks/useRealtimeRoom.ts`
- Test: `tests/services/roomService.test.ts`

**Interfaces:**
- Consumes: `src/services/supabase.ts`, `UserProfile`
- Produces: `roomService.createRoom(duration, hostProfile)`, `roomService.joinRoom(code, userProfile)`, `useRealtimeRoom(roomId)` managing room state, participants list, and failure broadcast.

- [ ] **Step 1: Write test for room creation and banned user guard**

```typescript
// tests/services/roomService.test.ts
import { canUserEnterRoom } from '../../src/services/roomService';
import { UserProfile } from '../../src/types';

describe('canUserEnterRoom', () => {
  it('should reject banned users from entering or creating rooms', () => {
    const bannedUser: UserProfile = {
      id: '2',
      email: 'banned@test.com',
      displayName: 'Cheater',
      role: 'user',
      status: 'banned',
      streak: 0,
      totalFocusMinutes: 0,
    };
    expect(canUserEnterRoom(bannedUser)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/services/roomService.test.ts`  
Expected: FAIL (cannot resolve `roomService`)

- [ ] **Step 3: Implement `roomService` with 6-digit PIN generator and permission checks**

Generate unique 6-digit numerical PINs. Enforce `canUserEnterRoom` check before executing room creation or participant join.

- [ ] **Step 4: Implement `useRealtimeRoom` hook using Supabase Presence & Broadcast**

Manage peer presence tracking, sync session start timestamp, broadcast member failure events (`MEMBER_FAILED: { userId, displayName }`), and arbitrate room-level failure state.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/services/roomService.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/services/roomService.ts src/hooks/useRealtimeRoom.ts tests/services/
git commit -m "feat: implement room service, pin generation and realtime room synchronization"
```

---

### Task 6: Main User Experience Screens (Home, Lobby, Session, Result)

**Files:**
- Create: `src/screens/HomeScreen.tsx`
- Create: `src/screens/CreateJoinRoomScreen.tsx`
- Create: `src/screens/LobbyScreen.tsx`
- Create: `src/screens/FocusSessionScreen.tsx`
- Create: `src/screens/ResultScreen.tsx`
- Test: `tests/screens/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `useSensors`, `useRealtimeRoom`
- Produces: Complete navigable user flow from Home to active session to Result

- [ ] **Step 1: Write component test for HomeScreen navigation and streak display**

```typescript
// tests/screens/HomeScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('should render user streak and action buttons', () => {
    const mockProfile = {
      id: '1',
      displayName: 'Warrior',
      streak: 5,
      totalFocusMinutes: 120,
      role: 'user',
      status: 'active',
      email: 'w@test.com',
    };
    const { getByText } = render(
      <HomeScreen profile={mockProfile as any} onNavigate={jest.fn()} />
    );
    expect(getByText(/5 ngày/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/HomeScreen.test.tsx`  
Expected: FAIL (cannot resolve `HomeScreen`)

- [ ] **Step 3: Implement `HomeScreen` and `CreateJoinRoomScreen`**

Display user profile, streak banner, and buttons for "Tạo phòng mới" (choose 15, 25, 30, 45 mins) and "Vào phòng bằng mã PIN".

- [ ] **Step 4: Implement `LobbyScreen`**

Show room PIN in large clear typography, list joined participants (2–6 users) with ready indicator, and start button for host.

- [ ] **Step 5: Implement `FocusSessionScreen` & `ResultScreen`**

Integrate `useSensors` and `ZenScreen`. When phone is flipped face-down, activate Zen screen. When timer completes, navigate to `ResultScreen` showing victory; if a participant fails, show defeat screen highlighting who broke focus.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest tests/screens/HomeScreen.test.tsx`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/CreateJoinRoomScreen.tsx src/screens/LobbyScreen.tsx src/screens/FocusSessionScreen.tsx src/screens/ResultScreen.tsx tests/screens/
git commit -m "feat: implement home, lobby, focus session and result screens"
```

---

### Task 7: Admin Dashboard & Ban Enforcement

**Files:**
- Create: `src/screens/AdminDashboardScreen.tsx`
- Create: `src/services/adminService.ts`
- Test: `tests/screens/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `src/services/supabase.ts`
- Produces: `adminService.listUsers()`, `adminService.toggleUserBan(userId, currentStatus)`, `AdminDashboardScreen`

- [ ] **Step 1: Write test for Admin ban toggle logic**

```typescript
// tests/screens/AdminDashboard.test.tsx
import { toggleBanStatus } from '../../src/services/adminService';

describe('adminService: toggleBanStatus', () => {
  it('should switch active to banned and banned to active', () => {
    expect(toggleBanStatus('active')).toBe('banned');
    expect(toggleBanStatus('banned')).toBe('active');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/screens/AdminDashboard.test.tsx`  
Expected: FAIL (cannot resolve `adminService`)

- [ ] **Step 3: Implement `adminService`**

Implement functions to fetch user profiles list, search users by display name or email, and update user status between `active` and `banned`.

- [ ] **Step 4: Implement `AdminDashboardScreen`**

Build search bar, user list item with user role and status badge, and an actionable "Khóa tài khoản" / "Mở khóa" button with confirmation alert.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/screens/AdminDashboard.test.tsx`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/screens/AdminDashboardScreen.tsx src/services/adminService.ts tests/screens/
git commit -m "feat: implement admin dashboard and user ban management system"
```

---

### Task 8: App Navigation & Full End-to-End Integration

**Files:**
- Create: `App.tsx`
- Modify: `src/hooks/useAuth.tsx`
- Test: `tests/integration/appFlow.test.tsx`

**Interfaces:**
- Consumes: All screens from Tasks 3, 6, 7
- Produces: Main application entry point with authentication routing, admin guard, and banned status interceptor.

- [ ] **Step 1: Write end-to-end integration test for routing flow**

```typescript
// tests/integration/appFlow.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('Application Root Navigation', () => {
  it('should render login screen when unauthenticated', () => {
    const { getByText } = render(<App />);
    expect(getByText(/đăng nhập/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/integration/appFlow.test.tsx`  
Expected: FAIL (cannot resolve `App`)

- [ ] **Step 3: Implement Root Navigator in `App.tsx`**

Integrate `AuthProvider`. If unauthenticated $\rightarrow$ show `LoginScreen` / `RegisterScreen`. If authenticated and banned $\rightarrow$ show `BannedModal`. If admin $\rightarrow$ show navigation bar with Admin Dashboard tab. If regular user $\rightarrow$ standard Home/Room flow.

- [ ] **Step 4: Run all tests across the entire test suite**

Run: `npx jest`  
Expected: PASS all test suites

- [ ] **Step 5: Commit**

```bash
git add App.tsx tests/integration/
git commit -m "feat: implement root navigation, auth routing and admin guard"
```
