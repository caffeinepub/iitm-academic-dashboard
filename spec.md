# IITM Academic Dashboard

## Current State
- Firebase Auth is set up in `lib/firebase.ts` with `useFirebaseAuth` hook for Google sign-in
- `StorageChoiceScreen` still uses `useInternetIdentity` for the "Sync Across Devices" option — Google login is not wired to the sync flow
- `useAppData` reads/writes only from localStorage via `utils/storage.ts`
- No Firestore integration exists yet
- No migration prompt exists when switching from local to cloud

## Requested Changes (Diff)

### Add
- Firestore instance exported from `lib/firebase.ts`
- `utils/firestoreSync.ts` — functions to read/write all user data (courses, attendance, tasks, semSettings, studentName, examEntries) to Firestore under `users/{uid}/` path
- Migration prompt modal: when a user who has local data chooses "Sync Across Devices", show a dialog asking "We found data on this device. Upload it to your Google account?" with Yes/No buttons
- If user says Yes: upload local data to Firestore, then use Firestore going forward
- If user says No: start fresh from Firestore (or empty if no cloud data)

### Modify
- `lib/firebase.ts`: add Firestore initialization and export `db`
- `StorageChoiceScreen.tsx`: replace `useInternetIdentity` with `useFirebaseAuth`. The "Sync Across Devices" button triggers Google sign-in popup. After successful login, check if local data exists and show migration prompt if so.
- `useAppData.ts`: accept optional `userId` and `storageMode` props. When `storageMode === 'sync'` and `userId` is set, sync data reads/writes to Firestore in addition to localStorage (localStorage as cache, Firestore as source of truth on load)
- `App.tsx`: pass `storageMode` and `userId` down to `useAppData`

### Remove
- `useInternetIdentity` usage from `StorageChoiceScreen`

## Implementation Plan
1. Add `getFirestore` and `db` export to `lib/firebase.ts`
2. Create `utils/firestoreSync.ts` with `loadUserData`, `saveUserData` functions
3. Update `StorageChoiceScreen` to use `useFirebaseAuth` for the sync option, handle migration prompt inline
4. Update `useAppData` to accept `{ userId?, storageMode }` and sync to Firestore on every state change when in sync mode
5. Update `App.tsx` to track `userId` and `storageMode` from login flow and pass to `useAppData`
6. Install `firebase/firestore` (already in firebase package)
