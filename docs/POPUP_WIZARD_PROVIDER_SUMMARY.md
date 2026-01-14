# PopupWizard Global Provider - Summary

## ✅ What Was Created

### 1. **PopupWizardManager.tsx**
A global context provider that manages PopupWizard state for the entire app.

**Location:** `/src/utils/PopupWizardManager.tsx`

**Features:**
- `showWizard(screens, onComplete?, gradientColors?)` - Show wizard from anywhere
- `hideWizard()` - Close wizard programmatically
- Single wizard instance for entire app
- Auto-cleanup after wizard closes

### 2. **Integration in Navigation**
Wrapped entire app with `<PopupWizardProvider>`

**Structure:**
```tsx
<PopupWizardProvider>        // ← NEW! Outermost wrapper
  <UpdateProvider>
    <SafeAreaProvider>
      {/* App navigation */}
    </SafeAreaProvider>
  </UpdateProvider>
</PopupWizardProvider>
```

### 3. **Updated Profile Screen**
Changed from local state to global hook

**Before:**
```tsx
const [showWizard, setShowWizard] = useState(false);

<PopupWizard visible={showWizard} ... />
```

**After:**
```tsx
const { showWizard } = usePopupWizard();

<TouchableOpacity onPress={() => showWizard(wizardScreens, handleComplete)}>
```

---

## 🎯 How to Use

### From Any Component

```tsx
import { usePopupWizard } from '../../utils/PopupWizardManager';
import { PopupScreen } from '../../components/common/PopupWizard';

function MyComponent() {
  const { showWizard } = usePopupWizard();

  const screens: PopupScreen[] = [
    {
      id: 'question1',
      icon: 'heart',
      title: 'My Title',
      message: 'My message',
      formType: 'input',
    },
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Data:', data);
  };

  return (
    <Button onPress={() => showWizard(screens, handleComplete)} />
  );
}
```

---

## 🔄 Comparison: UpdateManager vs PopupWizardManager

| Feature | UpdateManager | PopupWizardManager |
|---------|--------------|-------------------|
| **Purpose** | Show app update prompts | Show multi-step wizards |
| **Screens** | Fixed (UpdateScreen) | Dynamic (pass any screens) |
| **Use Cases** | App version updates | Surveys, onboarding, forms |
| **Flexibility** | Single use case | Multiple use cases |
| **API** | `showUpdate(isRequired)` | `showWizard(screens, onComplete, colors)` |

---

## 📍 Where You Can Use It

### ✅ Now Works From:

1. **Profile Screen** - Already implemented (demo button)
2. **Drawer Menu** - Hook available (`usePopupWizard`)
3. **Home Screen** - Can show onboarding
4. **Settings** - Can show preference wizards
5. **Any Screen** - Global access everywhere
6. **App Launch** - Show onboarding for new users

### Example Locations:

```tsx
// In Drawer (Navigation.tsx)
const { showWizard } = usePopupWizard();

// In Home Screen
const { showWizard } = usePopupWizard();

// In Settings
const { showWizard } = usePopupWizard();
```

---

## 🆚 Local vs Global

### Local State (Old Way)
```tsx
// Only works in THIS component
const [showWizard, setShowWizard] = useState(false);

<PopupWizard
  visible={showWizard}
  screens={screens}
  onComplete={handleComplete}
/>
```

**Limitations:**
- ❌ Can't trigger from other components
- ❌ Need to render in every component that uses it
- ❌ Props need to pass through component tree

### Global Provider (New Way)
```tsx
// Works from ANYWHERE
const { showWizard } = usePopupWizard();

showWizard(screens, handleComplete);
```

**Benefits:**
- ✅ Trigger from any component
- ✅ Single wizard instance
- ✅ No prop drilling
- ✅ Cleaner code

---

## 📚 Documentation

- **Main Guide:** [POPUP_WIZARD_USAGE.md](POPUP_WIZARD_USAGE.md)
- **Global Usage:** [POPUP_WIZARD_GLOBAL_USAGE.md](POPUP_WIZARD_GLOBAL_USAGE.md)
- **Component:** [PopupWizard.tsx](../src/components/common/PopupWizard.tsx)
- **Manager:** [PopupWizardManager.tsx](../src/utils/PopupWizardManager.tsx)

---

## 🎨 Example Use Cases

### 1. First-Time User Onboarding
```tsx
useEffect(() => {
  if (isFirstLaunch) {
    showWizard(onboardingScreens, saveOnboardingData);
  }
}, []);
```

### 2. Health Survey
```tsx
<Button onPress={() => showWizard(healthSurveyScreens, submitSurvey)} />
```

### 3. Preference Updates
```tsx
const updatePrefs = () => {
  showWizard(
    preferenceScreens,
    async (data) => {
      await api.updatePreferences(data);
      Alert.alert('Saved!');
    },
    ['#10B981', '#059669'] // Custom green
  );
};
```

---

## 🚀 Quick Start

1. **Import the hook:**
   ```tsx
   import { usePopupWizard } from '../../utils/PopupWizardManager';
   ```

2. **Use in component:**
   ```tsx
   const { showWizard } = usePopupWizard();
   ```

3. **Create screens:**
   ```tsx
   const screens = [{ id: 'q1', title: 'Question', ... }];
   ```

4. **Show wizard:**
   ```tsx
   showWizard(screens, (data) => console.log(data));
   ```

That's it! The wizard appears globally, collects data, and returns results.

---

## ✨ Key Advantages

1. **Global Access** - Call from anywhere, anytime
2. **Single Instance** - One wizard for entire app
3. **Dynamic Content** - Different screens for different flows
4. **Clean Architecture** - Context-based, no prop drilling
5. **Flexible** - Custom colors, callbacks, and screens
6. **Type-Safe** - Full TypeScript support

---

## 🔧 Files Modified

- ✅ Created: `PopupWizardManager.tsx`
- ✅ Updated: `Navigation.tsx` (added provider)
- ✅ Updated: `Profile.tsx` (uses global hook)
- ✅ Created: `POPUP_WIZARD_GLOBAL_USAGE.md`
