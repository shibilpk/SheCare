# PopupWizard Component Usage Guide

The `PopupWizard` component is a flexible, reusable popup modal that can display multiple screens with forms, images, and messages. It's perfect for onboarding flows, surveys, data collection, and interactive prompts.

## Features

- ✅ Multi-step wizard with progress indicator
- ✅ Support for images, icons, and custom graphics
- ✅ Multiple form types: text input, yes/no buttons, date picker, or no form
- ✅ Skip functionality (optional per screen)
- ✅ Custom gradient colors
- ✅ Collects and returns all user data
- ✅ API integration ready

## Import

```tsx
import PopupWizard, { PopupScreen } from '../components/common/PopupWizard';
```

## Basic Usage

### Example 1: Simple Onboarding Flow

```tsx
import React, { useState } from 'react';
import PopupWizard, { PopupScreen } from '../components/common/PopupWizard';

function MyComponent() {
  const [showWizard, setShowWizard] = useState(true);

  const screens: PopupScreen[] = [
    {
      id: 'welcome',
      icon: 'heart',
      title: 'Welcome to SheCare',
      message: 'Your personal health companion designed for women\'s wellness.',
      formType: 'none',
      buttonText: 'Get Started',
      allowSkip: true,
    },
    {
      id: 'name',
      icon: 'user',
      title: 'What\'s your name?',
      message: 'We\'d love to know how to address you.',
      formType: 'input',
      inputPlaceholder: 'Enter your name',
      allowSkip: false,
    },
  ];

  const handleComplete = (data: Record<string, any>) => {
    console.log('Wizard completed with data:', data);
    // data = { name: "Jane Doe" }

    // Send to API
    // fetch('/api/onboarding', { method: 'POST', body: JSON.stringify(data) });

    setShowWizard(false);
  };

  const handleSkip = () => {
    console.log('Wizard skipped');
    setShowWizard(false);
  };

  return (
    <PopupWizard
      visible={showWizard}
      screens={screens}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
```

### Example 2: Health Survey with All Form Types

```tsx
const healthSurvey: PopupScreen[] = [
  {
    id: 'tracking',
    icon: 'calendar',
    title: 'Period Tracking',
    message: 'Would you like to track your menstrual cycle?',
    formType: 'yesno',
    allowSkip: true,
  },
  {
    id: 'lastPeriod',
    icon: 'calendar',
    title: 'Last Period Date',
    message: 'When was your last period?',
    formType: 'datepicker',
    allowSkip: false,
  },
  {
    id: 'cycleLength',
    icon: 'clock',
    title: 'Cycle Length',
    message: 'What is your average cycle length in days?',
    formType: 'input',
    inputPlaceholder: 'e.g., 28',
    inputKeyboardType: 'numeric',
    allowSkip: false,
  },
];

const handleSurveyComplete = async (data: Record<string, any>) => {
  console.log('Survey data:', data);
  // data = {
  //   tracking: true,
  //   lastPeriod: "2026-01-01T00:00:00.000Z",
  //   cycleLength: "28"
  // }

  try {
    const response = await fetch('https://api.example.com/health-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log('API response:', result);
  } catch (error) {
    console.error('Failed to submit survey:', error);
  }
};
```

### Example 3: With Custom Images

```tsx
const imageScreens: PopupScreen[] = [
  {
    id: 'feature1',
    image: require('../assets/images/feature1.png'), // Local image
    title: 'Track Your Health',
    message: 'Monitor your menstrual cycle, mood, and symptoms easily.',
    formType: 'none',
    allowSkip: true,
  },
  {
    id: 'feature2',
    imageUrl: 'https://example.com/feature2.png', // Remote image
    title: 'Get Insights',
    message: 'Receive personalized health insights based on your data.',
    formType: 'none',
    allowSkip: true,
  },
];
```

### Example 4: Feedback Collection

```tsx
const feedbackFlow: PopupScreen[] = [
  {
    id: 'rating',
    icon: 'star',
    title: 'Enjoying SheCare?',
    message: 'We\'d love to hear your feedback!',
    formType: 'yesno',
    allowSkip: true,
  },
  {
    id: 'comments',
    icon: 'comment',
    title: 'Tell us more',
    message: 'What do you like most about the app?',
    formType: 'input',
    inputPlaceholder: 'Share your thoughts...',
    buttonText: 'Submit Feedback',
    allowSkip: true,
  },
];
```

## Props

### PopupWizardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Controls modal visibility |
| `screens` | `PopupScreen[]` | Yes | Array of screen configurations |
| `onComplete` | `(data: Record<string, any>) => void` | Yes | Callback when wizard completes |
| `onSkip` | `() => void` | No | Callback when skip is pressed |
| `gradientColors` | `string[]` | No | Custom gradient colors (default: `['#EC4899', '#8B5CF6']`) |

### PopupScreen Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the screen (used as key in returned data) |
| `image` | `any` | No | Local image source (using `require()`) |
| `imageUrl` | `string` | No | Remote image URL |
| `icon` | `string` | No | Fontello icon name |
| `title` | `string` | Yes | Screen title |
| `message` | `string` | Yes | Screen message/description |
| `formType` | `'input' \| 'yesno' \| 'datepicker' \| 'none'` | No | Type of form element (default: `'none'`) |
| `inputPlaceholder` | `string` | No | Placeholder for input field |
| `inputKeyboardType` | `'default' \| 'email-address' \| 'numeric' \| 'phone-pad'` | No | Keyboard type for input |
| `buttonText` | `string` | No | Custom button text (default: "Next" or "Confirm" on last screen) |
| `allowSkip` | `boolean` | No | Show skip button (default: `false`) |
| `skipButtonText` | `string` | No | Custom skip button text (default: "Skip") |

## Form Types

### 1. None (`formType: 'none'`)
No form element, just message and next button.

### 2. Text Input (`formType: 'input'`)
Text input field with customizable keyboard type.

### 3. Yes/No Buttons (`formType: 'yesno'`)
Two buttons for binary choice. Automatically proceeds to next screen on selection.
- Returns: `true` for Yes, `false` for No

### 4. Date Picker (`formType: 'datepicker'`)
Date selection with native date picker modal.
- Returns: ISO date string

## API Integration Example

```tsx
import ApiClient from '../utils/ApiClient';

const handleWizardComplete = async (data: Record<string, any>) => {
  try {
    // Using your ApiClient
    const response = await ApiClient.post('/user/preferences', data);
    console.log('Success:', response);

    // Or using fetch
    const result = await fetch('https://api.example.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourToken}`,
      },
      body: JSON.stringify(data),
    });

    if (result.ok) {
      // Handle success
    }
  } catch (error) {
    console.error('Failed to submit:', error);
  }
};
```

## Tips

1. **Skip Button**: Set `allowSkip: true` on screens where users should be able to skip
2. **Required Fields**: Set `allowSkip: false` on screens with required information
3. **Yes/No Screens**: Don't show Next button for yes/no screens (handled automatically)
4. **Progress Indicator**: Automatically shown when there are 2+ screens
5. **Data Collection**: Data is collected using screen IDs as keys
6. **Validation**: Add validation logic in `onComplete` before API submission

## Available Fontello Icons

Common icons you can use:
- `heart`, `user`, `calendar`, `clock`, `star`, `comment`
- `ok`, `cancel`, `attention`, `download`
- `right-open-mini`, `left-open-mini`
- Check `FontelloIcons.tsx` for full list

## Custom Styling

You can customize gradient colors:

```tsx
<PopupWizard
  gradientColors={['#FF6B6B', '#4ECDC4']} // Custom gradient
  // ... other props
/>
```
