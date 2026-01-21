# Update Screen Usage Guide

## Overview
The UpdateScreen component provides a reusable modal for prompting users to update the app. It can be displayed anywhere in the app with an option to skip (unless required).

## Features
- ✨ Beautiful gradient header design
- 📱 Shows version and update notes
- ⚡ Can be required or optional
- 🔄 Links to App Store / Play Store
- ⏭️ Skip option (when not required)
- 🎨 Consistent with app's design system

## Basic Usage

### Option 1: Using UpdateProvider (Recommended)

#### 1. Wrap your app with UpdateProvider

```tsx
// App.tsx
import { UpdateProvider } from './src/utils/UpdateManager';

function App() {
  return (
    <UpdateProvider>
      {/* Your app content */}
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </UpdateProvider>
  );
}
```

#### 2. Show update from anywhere in the app

```tsx
import { useUpdate } from '../utils/UpdateManager';

function MyScreen() {
  const { showUpdate } = useUpdate();

  const checkForUpdate = () => {
    // Show optional update
    showUpdate(false);

    // OR show required update
    // showUpdate(true);
  };

  return (
    <TouchableOpacity onPress={checkForUpdate}>
      <Text>Check for Updates</Text>
    </TouchableOpacity>
  );
}
```

### Option 2: Direct Component Usage

```tsx
import React, { useState } from 'react';
import { UpdateScreen } from '../screens';

function MyScreen() {
  const [showUpdate, setShowUpdate] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowUpdate(true)}>
        <Text>Check for Updates</Text>
      </TouchableOpacity>

      <UpdateScreen
        visible={showUpdate}
        onSkip={() => setShowUpdate(false)}
        onUpdate={() => {
          setShowUpdate(false);
          // Handle update action
        }}
        version="2.0.0"
        isRequired={false}
        updateNotes={[
          'Improved sleep tracking features',
          'New health insights dashboard',
          'Bug fixes and performance improvements',
        ]}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | - | Controls modal visibility (required) |
| `onSkip` | `() => void` | - | Called when user skips (required) |
| `onUpdate` | `() => void` | - | Called when user clicks update (required) |
| `version` | `string` | `'2.0.0'` | Version number to display |
| `updateNotes` | `string[]` | Default notes | List of what's new items |
| `isRequired` | `boolean` | `false` | If true, hides skip button and prevents dismissal |

## Examples

### Show on App Start
```tsx
useEffect(() => {
  const checkVersion = async () => {
    const latestVersion = await fetchLatestVersion();
    const currentVersion = DeviceInfo.getVersion();

    if (latestVersion > currentVersion) {
      showUpdate(false);
    }
  };

  checkVersion();
}, []);
```

### Force Update
```tsx
// Show required update
showUpdate(true);
```

### With Custom Update Notes
```tsx
<UpdateScreen
  visible={visible}
  onSkip={handleSkip}
  onUpdate={handleUpdate}
  version="3.1.0"
  updateNotes={[
    'Critical security updates',
    'Fixed sync issues',
    'New pregnancy tracker features',
  ]}
  isRequired={true}
/>
```

## Customization

To customize the app store URLs, edit `UpdateScreen.tsx`:

```tsx
const handleUpdate = () => {
  const storeURL = Platform.OS === 'ios'
    ? 'https://apps.apple.com/app/your-actual-app-id'
    : 'https://play.google.com/store/apps/details?id=com.your.app';

  Linking.openURL(storeURL);
  onUpdate();
};
```

## Integration with Update Check Service

The app now includes an automatic update check service that runs on app load and checks for updates only once per day.

### Automatic Check (Recommended)

The update check runs automatically when the app starts via `UpdateProvider`:

```tsx
// Already integrated - no code needed!
// The UpdateProvider in App.tsx handles this automatically
```

**How it works:**
1. App launches
2. `UpdateProvider` calls `checkForUpdates()` automatically
3. If 24 hours have passed since last check:
   - Makes API call to `/api/v1/app/version`
   - Compares current version with latest
   - Shows UpdateScreen if update available
4. If checked within 24 hours:
   - Skips API call (cached)
   - No modal shown

### Manual Check in Settings

Add a "Check for Updates" button in your settings screen:

```tsx
import { useUpdate } from '../utils/UpdateManager';
import { forceCheckForUpdates } from '../services/updateService';

function SettingsScreen() {
  const { showUpdate } = useUpdate();
  const [checking, setChecking] = useState(false);

  const handleCheckUpdates = async () => {
    setChecking(true);
    try {
      // Force check (bypasses 24-hour limit)
      const updateInfo = await forceCheckForUpdates();

      if (updateInfo.shouldUpdate) {
        showUpdate(updateInfo.isRequired);
      } else {
        Alert.alert('No Updates', 'You are using the latest version!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check for updates');
    } finally {
      setChecking(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleCheckUpdates} disabled={checking}>
      <Text>{checking ? 'Checking...' : 'Check for Updates'}</Text>
    </TouchableOpacity>
  );
}
```

### Service Functions

```tsx
// services/updateService.ts
import { checkForUpdates, forceCheckForUpdates, getLastUpdateCheckTime } from '../services/updateService';

// Automatic check (respects 24-hour limit)
const updateInfo = await checkForUpdates();

// Force check (bypasses 24-hour limit)
const updateInfo = await forceCheckForUpdates();

// Get last check time
const lastCheck = await getLastUpdateCheckTime();
console.log('Last checked:', lastCheck?.toLocaleString());
```

### API Response Format

Your backend should return:

```json
{
  "latestVersion": "2.1.0",
  "isRequired": false,
  "releaseNotes": [
    "Improved sleep tracking features",
    "New health insights dashboard",
    "Bug fixes and performance improvements"
  ],
  "minimumVersion": "1.5.0"
}
```

**Endpoint:** `GET /api/v1/app/version`

### Configuration

The service checks once every 24 hours by default. To change this, edit `src/services/updateService.ts`:

```ts
// Change check interval
const ONE_DAY_MS = 12 * 60 * 60 * 1000; // 12 hours
```

For more details, see [UPDATE_SERVICE_API.md](./UPDATE_SERVICE_API.md)

## Notes
- The component uses `react-native-linear-gradient` for the header gradient
- Update links need to be configured with your actual App Store/Play Store URLs
- When `isRequired={true}`, the back button and skip option are hidden
- The component is fully styled to match the app's design system
