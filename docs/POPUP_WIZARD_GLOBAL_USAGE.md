# PopupWizard Global Manager Usage

The `PopupWizardManager` provides a global context for showing PopupWizard from **anywhere** in your app.

## Setup

Already configured in [Navigation.tsx](../utils/Navigation.tsx):

```tsx
<PopupWizardProvider>
  <UpdateProvider>
    <SafeAreaProvider>
      {/* Your app */}
    </SafeAreaProvider>
  </UpdateProvider>
</PopupWizardProvider>
```

## Usage

### Import the Hook

```tsx
import { usePopupWizard } from '../../utils/PopupWizardManager';
import { PopupScreen } from '../../components/common/PopupWizard';
```

### Use from Any Component

```tsx
function MyComponent() {
  const { showWizard, hideWizard } = usePopupWizard();

  const handleButtonPress = () => {
    const screens: PopupScreen[] = [
      {
        id: 'welcome',
        icon: 'heart',
        title: 'Welcome!',
        message: 'Let\'s get started',
        formType: 'none',
        allowSkip: true,
      },
      {
        id: 'name',
        icon: 'user',
        title: 'Your Name',
        message: 'What should we call you?',
        formType: 'input',
        inputPlaceholder: 'Enter your name',
      },
    ];

    const handleComplete = (data: Record<string, any>) => {
      console.log('Got data:', data);
      // Send to API or do something
    };

    // Show the wizard!
    showWizard(screens, handleComplete);
  };

  return (
    <TouchableOpacity onPress={handleButtonPress}>
      <Text>Start Wizard</Text>
    </TouchableOpacity>
  );
}
```

## API

### `showWizard(screens, onComplete?, gradientColors?)`

Shows the popup wizard globally.

**Parameters:**
- `screens` - Array of PopupScreen objects
- `onComplete` - Optional callback when wizard completes
- `gradientColors` - Optional custom gradient colors

**Example:**
```tsx
showWizard(
  screens,
  (data) => console.log(data),
  ['#FF6B6B', '#4ECDC4'] // Custom colors
);
```

### `hideWizard()`

Manually closes the wizard.

```tsx
hideWizard();
```

## Examples

### 1. From Home Screen

```tsx
// HomeScreen.tsx
import { usePopupWizard } from '../../utils/PopupWizardManager';

function HomeScreen() {
  const { showWizard } = usePopupWizard();

  const showOnboarding = () => {
    showWizard([
      {
        id: 'intro',
        icon: 'heart',
        title: 'Welcome to SheCare',
        message: 'Your health companion',
        formType: 'none',
      },
    ]);
  };

  return <Button onPress={showOnboarding} title="Start Onboarding" />;
}
```

### 2. From Settings

```tsx
// Settings.tsx
const { showWizard } = usePopupWizard();

const updatePreferences = () => {
  showWizard(
    [
      {
        id: 'notifications',
        title: 'Enable Notifications?',
        formType: 'yesno',
      },
      {
        id: 'theme',
        title: 'Choose Theme',
        formType: 'input',
      },
    ],
    async (data) => {
      await saveToAPI(data);
      Alert.alert('Saved!');
    }
  );
};
```

### 3. From Drawer Menu

```tsx
// Drawer.tsx
const { showWizard } = usePopupWizard();

<TouchableOpacity onPress={() => showWizard(feedbackScreens)}>
  <Text>Give Feedback</Text>
</TouchableOpacity>
```

### 4. Programmatically (on app launch)

```tsx
// App.tsx or Navigation.tsx
useEffect(() => {
  // Show onboarding for new users
  if (isFirstTime) {
    showWizard(onboardingScreens, handleOnboardingComplete);
  }
}, []);
```

### 5. With Custom Colors

```tsx
showWizard(
  screens,
  handleComplete,
  ['#10B981', '#059669'] // Green gradient
);
```

## Comparison with Local State

### Before (Local State)
```tsx
// Only works in this component
const [visible, setVisible] = useState(false);

<PopupWizard
  visible={visible}
  screens={screens}
  onComplete={handleComplete}
/>
```

### After (Global Provider)
```tsx
// Works from anywhere!
const { showWizard } = usePopupWizard();

showWizard(screens, handleComplete);
```

## Benefits

✅ **Global Access** - Trigger from any component
✅ **No Prop Drilling** - No need to pass through components
✅ **Single Instance** - One wizard for entire app
✅ **Clean Code** - Less boilerplate
✅ **Flexible** - Different screens for different triggers

## Common Use Cases

1. **First-time user onboarding**
2. **Feature introductions**
3. **Data collection surveys**
4. **Preference updates**
5. **Feedback forms**
6. **Health assessments**
7. **Goal setting wizards**

## Profile Screen Example

The Profile screen now uses the global hook:

```tsx
const { showWizard } = usePopupWizard();

<TouchableOpacity
  onPress={() => showWizard(wizardScreens, handleWizardComplete)}
>
  <Text>Try Popup Wizard</Text>
</TouchableOpacity>
```

No need for local state or component rendering!
