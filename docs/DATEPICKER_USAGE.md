# DatePicker Component Usage Guide

A reusable date/time picker component for React Native that wraps `react-native-modal-datetime-picker` with a clean, customizable interface.

## Basic Usage

```tsx
import { DatePicker } from '../../components';

// Simple date picker
<DatePicker
  label="Select Date"
  value={myDate}
  onChange={(date) => setMyDate(date)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Optional label text displayed above the picker |
| `value` | `Date` | **Required** | The current date value |
| `onChange` | `(date: Date) => void` | **Required** | Callback when date is selected |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'date'` | Picker mode |
| `placeholder` | `string` | `'Select date'` | Placeholder text when no value |
| `minimumDate` | `Date` | - | Minimum selectable date |
| `maximumDate` | `Date` | - | Maximum selectable date |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `format` | `(date: Date) => string` | - | Custom date formatting function |
| `containerStyle` | `ViewStyle` | - | Style for container |
| `labelStyle` | `TextStyle` | - | Style for label |
| `buttonStyle` | `ViewStyle` | - | Style for picker button |
| `textStyle` | `TextStyle` | - | Style for displayed text |

## Examples

### Date of Birth Picker (with max date)
```tsx
<DatePicker
  label="Date of Birth"
  value={dateOfBirth}
  onChange={setDateOfBirth}
  mode="date"
  maximumDate={new Date()}
/>
```

### Time Picker
```tsx
<DatePicker
  label="Reminder Time"
  value={reminderTime}
  onChange={setReminderTime}
  mode="time"
/>
```

### Custom Format
```tsx
<DatePicker
  label="Appointment Date"
  value={appointmentDate}
  onChange={setAppointmentDate}
  format={(date) => date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
/>
```

### With Object State
```tsx
const [weightData, setWeightData] = useState({
  weight: '',
  weight_unit: 'kg',
  weight_date: new Date(),
});

<DatePicker
  label="Weight Date"
  value={weightData.weight_date}
  onChange={(date) => setWeightData({ ...weightData, weight_date: date })}
/>
```

### Inline (No Label)
```tsx
<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Choose a date"
/>
```

### Disabled State
```tsx
<DatePicker
  label="Fixed Date"
  value={fixedDate}
  onChange={() => {}}
  disabled={true}
/>
```

### With Custom Styling
```tsx
<DatePicker
  label="Custom Styled Picker"
  value={myDate}
  onChange={setMyDate}
  containerStyle={{ marginBottom: 24 }}
  labelStyle={{ fontSize: 16, color: '#6366F1' }}
  buttonStyle={{
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF'
  }}
  textStyle={{ color: '#6366F1', fontWeight: '600' }}
/>
```

## Features

✅ **Self-contained** - Manages its own modal state
✅ **Flexible** - Supports date, time, and datetime modes
✅ **Customizable** - Full styling control
✅ **Accessible** - Proper labels and disabled states
✅ **Type-safe** - Full TypeScript support
✅ **Smart icons** - Automatically shows calendar/clock based on mode
✅ **Clean API** - Simple onChange callback pattern

## Migration from Manual DateTimePickerModal

**Before:**
```tsx
const [date, setDate] = useState(new Date());
const [visible, setVisible] = useState(false);

<TouchableOpacity onPress={() => setVisible(true)}>
  <Text>{date.toLocaleDateString()}</Text>
</TouchableOpacity>

<DateTimePickerModal
  isVisible={visible}
  date={date}
  onConfirm={(d) => { setDate(d); setVisible(false); }}
  onCancel={() => setVisible(false)}
/>
```

**After:**
```tsx
const [date, setDate] = useState(new Date());

<DatePicker
  value={date}
  onChange={setDate}
/>
```

Much cleaner! 🎉
