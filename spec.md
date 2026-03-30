# IITM Academic Dashboard

## Current State
- Timetable: strict IITM slot grid (Mon-Fri, 8:00–17:50, 9 columns), no evening slots
- NotificationManager: schedules morning summary, exam alerts, task alerts, attendance alerts — no user control
- SettingsView: profile, semester override, data clear/export — no notification toggles

## Requested Changes (Diff)

### Add
- Evening/Extra section below timetable grid with time column 18:00–20:00 (for Happiness of Living, NSO, extra classes)
- Extra courses can be added with custom name, day(s), and time (defaults to 6–8 PM)
- Notification preferences stored in localStorage (`notificationPrefs` key)
- Notification toggles in SettingsView: Morning Summary (7 AM), Exam Alerts, Task Alerts, Attendance Alerts
- NotificationManager reads prefs and skips disabled alert types

### Modify
- SettingsView: add Notifications section with four toggle switches
- NotificationManager: accept notificationPrefs prop; skip building disabled alert categories
- Timetable: add "Evening & Extra Classes" panel below main grid

### Remove
- Nothing removed

## Implementation Plan
1. Add `notificationPrefs` type and default to types/utils
2. Update App.tsx to load/save notificationPrefs from localStorage and pass to SettingsView and NotificationManager
3. Add Notifications section to SettingsView with four toggle switches (styled as glass cards)
4. Update NotificationManager to accept and respect notificationPrefs
5. Add Evening/Extra section to Timetable below the main grid — simple card list per day, add/remove extra course entries with time 18:00–20:00 default
