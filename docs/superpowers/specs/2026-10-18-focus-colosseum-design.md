# Focus Colosseum - Design Document

**Date:** 2026-10-18  
**Topic:** Focus Colosseum (Đấu trường tập trung)  
**Status:** In Review  
**Target Platform:** Mobile (Android & iOS via React Native / Expo)  

---

## 1. Intent & The Why

### 1.1. Bối cảnh & Vấn đề
Các ứng dụng tăng cường tập trung hiện tại (như Pomodoro truyền thống, Forest) chủ yếu hoạt động dựa trên sự tự giác của từng cá nhân. Khi người dùng gặp cám dỗ từ mạng xã hội hoặc trò chơi di động, họ rất dễ phá vỡ cam kết một mình mà không phải chịu bất kỳ áp lực hay hậu quả nào.

### 1.2. Giải pháp (Focus Colosseum)
Focus Colosseum biến các phiên tập trung học tập và làm việc thành một trò chơi sinh tồn mang tính đồng đội cho nhóm nhỏ (2–6 người). Ứng dụng tận dụng:
- **Áp lực bạn bè tích cực (Positive Peer Pressure):** Cả nhóm cùng có chung mục tiêu; nếu một người phá vỡ kỷ luật, nỗ lực chung của cả phòng sẽ chịu ảnh hưởng.
- **Cảm biến phần cứng thực tế (Hardware Detection):** Bắt buộc người dùng úp điện thoại xuống bàn bằng cảm biến gia tốc/con quay hồi chuyển và theo dõi trạng thái ứng dụng (`AppState`).
- **Đồng bộ thời gian thực (Real-time Sync):** Cập nhật mili-giây trạng thái sống sót và tiến trình tập trung của từng thành viên.

---

## 2. Goals, Non-Goals & Anti-Goals

### 2.1. Goals (Mục tiêu cho bản đầu tiên - MVP)
- **Hệ thống xác thực & Phân quyền (Auth & RBAC):**
  - Đăng ký, đăng nhập tài khoản bằng Email / Mật khẩu (thông qua Supabase Auth).
  - Phân quyền người dùng (`user`) và quản trị viên (`admin`).
  - Lưu trữ hồ sơ người dùng: Biệt danh, email, chuỗi ngày kỷ luật (streak), tổng thời gian tập trung, và trạng thái tài khoản (`active` hoặc `banned`).
- **Hệ thống Quản trị viên (Admin Management & Ban System):**
  - Màn hình dành riêng cho tài khoản Admin: Xem danh sách toàn bộ người dùng và trạng thái của họ.
  - Chức năng Khóa / Mở khóa tài khoản: Admin có thể khóa tài khoản của người dùng có hành vi vi phạm hoặc gian lận.
  - Cơ chế chặn vi phạm: Tài khoản ở trạng thái `banned` sẽ bị hệ thống (thông qua chính sách Supabase Row Level Security) từ chối quyền tạo phòng mới và quyền tham gia vào bất kỳ phòng nào.
- **Quản lý phòng nhóm nhỏ:** Tạo phòng nhanh với mã PIN 6 số, cho phép 2–6 thành viên tham gia (chỉ áp dụng cho tài khoản hợp lệ).
- **Thiết lập phiên tập trung:** Trưởng phòng chọn thời gian tập trung (15, 25, 30, hoặc 45 phút).
- **Phát hiện xao nhãng bằng cảm biến:**
  - Nhận diện máy úp mặt xuống bàn thông qua cảm biến gia tốc (`expo-sensors`).
  - Lắng nghe trạng thái ứng dụng: phát hiện lập tức khi app bị đẩy xuống chạy nền hoặc người dùng chuyển app khác (`AppState`).
  - Cung cấp thời gian ân hạn ngắn (Grace Period, 10 giây) để tránh phạt nhầm khi người dùng vô tình dịch chuyển điện thoại.
- **Cơ chế sinh tồn nghiêm ngặt (Strict Survival Mode):**
  - Cả phòng cùng tích lũy điểm và xây dựng công trình chung theo từng phút.
  - Nếu bất kỳ thành viên nào vi phạm quá thời gian ân hạn, phiên tập trung thất bại.
  - Hệ thống gửi thông báo nêu tên thành viên vi phạm đến toàn bộ người trong phòng.
- **Tổng kết & Kỷ lục:** Hiển thị màn hình chiến thắng hoặc thất bại, ghi nhận số phút tập trung thành công vào lịch sử cá nhân và chuỗi ngày kỷ luật (Streak).

### 2.2. Non-Goals (Chưa làm trong MVP - Dành cho Roadmap tương lai)
- Chưa hỗ trợ chế độ phòng lớn (hàng chục đến hàng trăm người như cả lớp học).
- Chưa xây dựng hệ thống Clan Wars (đấu bang hội tranh đoạt pháo đài).
- Chưa tích hợp sự kiện Raid Boss toàn cộng đồng.
- Chưa có hệ thống vật phẩm ảo nạp tiền hoặc thương mại điện tử.
- Chưa hỗ trợ đàm thoại âm thanh (Voice chat) trong lúc tập trung (nhằm tránh gây xao nhãng).

### 2.3. Anti-Goals (Tuyệt đối không làm)
- **Không xâm phạm quyền riêng tư:** Tuyệt đối không bật camera, không chụp ảnh người dùng, không đọc danh bạ hay tin nhắn cá nhân. Chỉ đọc thông số cảm biến vật lý của thiết bị.
- **Không gây kiệt pin:** Tần số đọc cảm biến được tối ưu hóa ở mức vừa đủ (polling rate hợp lý, không spam liên tục hàng nghìn lần mỗi giây).
- **Không gây ức chế tiêu cực:** Cơ chế "bêu tên" khi vi phạm mang tính chất vui vẻ, nhắc nhở kỷ luật bạn bè, không kèm hành vi độc hại (toxic).

---

## 3. Constraints & Tech Stack Decisions

### 3.1. Nền tảng & Framework
- **Framework:** React Native kết hợp với **Expo** (Managed workflow với Prebuild / Config Plugins khi cần).
- **Ngôn ngữ:** **TypeScript** (Strict mode) đảm bảo tính an toàn dữ liệu và dễ bảo trì.
- **Công cụ phát triển:**
  - **Antigravity:** Đảm nhiệm viết code, cấu hình kiến trúc, quản lý file và chạy lệnh build/kiểm thử.
  - **Android Studio:** Mở máy ảo Android (Emulator) và kết nối điện thoại Android thật (qua USB Debugging) để kiểm tra tính năng cảm biến thực tế.

### 3.2. Cảm biến, Quản lý màn hình & Âm thanh
- **Quản lý trạng thái màn hình (`expo-keep-awake`):**
  - Do hệ điều hành di động sẽ tạm ngưng đọc cảm biến khi thiết bị rơi vào chế độ khóa màn hình (Sleep/Lock), ứng dụng sẽ tự động giữ màn hình luôn bật và chuyển sang giao diện đen tuyệt đối (OLED True Black "Zen Screen") khi úp máy để tiết kiệm tối đa pin.
  - Thao tác bấm nút nguồn khóa máy hoặc chuyển app sẽ được phát hiện qua `AppState` và kích hoạt đếm ngược thời gian ân hạn.
- **Thư viện cảm biến `expo-sensors`:**
  - `Accelerometer`: Theo dõi góc nghiêng trục $Z$. Khi $Z \approx -1.0$ (dung sai $\pm 0.2$), xác định điện thoại đang được úp mặt xuống bàn.
- **Hệ thống cảnh báo âm thanh & rung (Audio & Haptics):**
  - Do máy đang úp mặt xuống bàn nên thông báo hình ảnh trên màn hình là vô hình. Ứng dụng tích hợp âm thanh cảnh báo (còi báo động / chuông hiệu) kết hợp rung phản hồi haptics để người dùng nghe thấy ngay khi có cảnh báo vi phạm.

### 3.3. Cơ sở dữ liệu & Đồng bộ thời gian thực
- **BaaS (Backend-as-a-Service):** **Supabase Realtime**.
  - Sử dụng **Supabase Realtime Presence & Broadcast** để đồng bộ trạng thái phòng và nhịp tim kết nối (Heartbeat) giữa các máy khách.
  - Xử lý mất mạng/tắt app đột ngột: Cơ chế Presence Heartbeat với thời gian chờ 15 giây trước khi kết luận thành viên mất kết nối.
  - Lưu trữ dữ liệu:
    - Bảng `profiles`: `id`, `email`, `display_name`, `role` (`user` | `admin`), `status` (`active` | `banned`), `streak`, `total_focus_minutes`.
    - Bảng `rooms`: `id`, `code` (mã PIN 6 số), `host_id`, `duration_minutes`, `status` (`waiting` | `active` | `completed` | `failed`).
    - Bảng `room_participants`: `room_id`, `user_id`, `status` (`ready` | `focusing` | `failed`).
    - Bảng `sessions`: lưu lịch sử phiên học.

### 3.4. Kiến trúc mã nguồn
- Áp dụng cấu trúc thư mục rõ ràng:
  - `/src/components`: UI components tái sử dụng (Button, Card, TimerDisplay, Avatar).
  - `/src/screens`: 
    - Xác thực: `LoginScreen`, `RegisterScreen`.
    - Người dùng: `HomeScreen`, `CreateJoinRoomScreen`, `LobbyScreen`, `FocusSessionScreen`, `ResultScreen`.
    - Quản trị: `AdminDashboardScreen` (Quản lý và khóa/mở khóa user).
  - `/src/hooks`: Custom hooks tách biệt logic (`useSensors`, `useRealtimeRoom`, `useTimer`, `useAuth`).
  - `/src/services`: Tương tác với Supabase API và Realtime.
  - `/src/types`: Định nghĩa toàn bộ kiểu dữ liệu TypeScript.

---

## 4. What's Left to the Builder

Các quyết định kỹ thuật chi tiết dành cho người thực thi:
1. **Thiết kế giao diện UI/UX:** Bảng màu chủ đạo (phong cách đấu trường cổ đại La Mã kết hợp hiện đại tối giản / Dark mode), hiệu ứng rung phản hồi (Haptic feedback) khi có người thất bại.
2. **Chi tiết tham số cảm biến:** Ngưỡng dung sai của trục $Z$ và thời gian ân hạn mặc định (10 giây).
3. **Cấu hình Supabase Tables & RLS:** Định nghĩa schema cụ thể cho các bảng cơ sở dữ liệu và chính sách bảo mật Row Level Security.
