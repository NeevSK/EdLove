# Profile Enhancements Walkthrough

I have enhanced the User Profile section with the following features:

## 1. Role Management
- Added `developer` (Founder/Development Admin) role to `UserRole` type.
- Implemented a **Role Selector** in the "Edit Profile" modal (visible for testing) to switch roles without re-logging.

## 2. Profile Expansion
- **Full Screen Mode**: Tapping "EXPAND" on the Identity Card opens a detailed modal.
- **Identity Card Logic**: Added "Expand" button and updated flip logic.
- **Detailed View**: Shows extended contact info (School, Email, Phone) and a large QR code.

## 3. QR Code Integration
- **Unified Component**: Created `QRCodeGenerator` for consistent QR rendering.
- **Mobile Scanner**: Implemented `ScannerModal` using `expo-camera` to scan QR codes.
- **Identity QR**: Back of Identity Card now displays user's unique ID as a QR code.
- **Invite QR**: Principals can generate QR codes; Users can scan them to join.
- **Scan to Join**: Added "Scan Invite Code" button to `AuthScreen` that opens the camera.

## 4. User Stats & Gamification
- Created `UserStatsCard` component.
- Dynamically displays stats based on role (e.g., "Classes Taught" for teachers, "Streak" for students).
- Added visual "Guru Level" progress bar placeholder.

## 5. Help & Support
- Added `SupportSection` with links to Contact Support, FAQs, and Report Issue.

## verification
- **Logout**: Verified `signOut` logic is attached to the Logout button.
- **UI Components**: Verified `gluestack-ui` components (`Modal`, `Button`, `HStack`, etc.) are correctly imported and used.
- **Dependencies**: Added `expo-image-picker` and `expo-camera`.
    - `npm install expo-image-picker expo-camera`

## Screenshots
(Placeholder for actual screenshots)
