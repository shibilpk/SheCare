# Main Card Logic Migration to Backend

## Changes Made

### Backend (Django)

**1. Updated Schema** (`periods/apis/v1/schemas.py`)
```python
class CurrentPeriodSchema(Schema):
    # ... existing fields ...

    # New: Main card display data (server-calculated)
    card_status: str
    card_label: str
    card_value: str
    card_subtitle: str
    card_button_text: str
```

**2. Added Service Function** (`periods/services.py`)
```python
def calculate_main_card_display(profile, active_period):
    """
    Calculate main card display data using server time.
    Handles all the complex logic:
    - Period active state
    - Late period detection
    - Fertile window detection
    - Next event calculation (ovulation vs period)
    - Date formatting
    """
```

**3. Updated Status Service** (`periods/services.py`)
```python
def get_current_period_status(profile):
    # ... existing code ...
    card_data = calculate_main_card_display(profile, active_period)
    return {
        # ... existing fields ...
        **card_data,  # Add card display data
    }
```

### Frontend (React Native)

**1. Updated Interface** (`Home.tsx`)
```typescript
interface CustomerPeriodData {
  // ... existing fields ...

  // New: Server-calculated display fields
  card_status: string;
  card_label: string;
  card_value: string;
  card_subtitle: string;
  card_button_text: string;
}
```

**2. Simplified Helper Functions** (`Home.tsx`)
```typescript
// BEFORE: 100+ lines of complex logic
const getCardLabel = () => {
  if (isLoadingPeriod) return '';
  if (periodStarted) return 'Current Period';
  if (isPeriodLate()) return 'Period';
  return getNextEventLabel();
};

// AFTER: Simple getters
const getCardLabel = () => {
  if (isLoadingPeriod) return '';
  return customerPeriodData?.card_label || 'Next Event';
};
```

## Benefits

### ✅ Server Time Consistency
- All calculations use server timezone
- No client-side timezone issues
- Consistent across all devices

### ✅ Simplified Frontend
**Before:**
- ~150 lines of complex logic
- Multiple helper functions
- Date calculations
- Nested ternary operators

**After:**
- ~20 lines of simple getters
- Just display server data
- No date calculations
- Clean and readable

### ✅ Single Source of Truth
- Logic in one place (backend)
- Easier to test
- Easier to maintain
- Consistent behavior

### ✅ Better Performance
- No client-side date calculations
- Less JavaScript execution
- Simpler rendering logic

### ✅ Easier Updates
Need to change the display logic? Update one function in the backend:
```python
# All clients automatically get the new logic
def calculate_main_card_display(profile, active_period):
    # Change logic here
    # No app update needed!
```

## Migration Checklist

- [x] Update backend schema with card fields
- [x] Create `calculate_main_card_display()` function
- [x] Update `get_current_period_status()` to include card data
- [ ] Run backend migrations (if needed)
- [ ] Test backend API response
- [x] Update frontend TypeScript interface
- [x] Simplify frontend helper functions
- [ ] Remove old complex logic (optional cleanup)
- [ ] Test frontend display
- [ ] Deploy backend first
- [ ] Then deploy/update frontend

## Example API Response

```json
{
  "active_period": null,
  "is_fertile": false,
  "pregnancy_chance": "low",
  "next_period_date": "2026-02-15",
  "ovulation_date": "2026-02-10",
  "late_period_days": 3,

  "card_status": "period_late",
  "card_label": "Period Late",
  "card_value": "3 Days",
  "card_subtitle": "Expected: Feb 12, 2026",
  "card_button_text": "Start Period"
}
```

## Testing

### Backend Test
```bash
curl -X GET http://localhost:8000/api/v1/period/customer-data/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Test
The card should now display server-calculated values automatically.

## Rollback Plan

If issues arise:
1. Backend can keep sending new fields (backward compatible)
2. Frontend can fall back to old logic if new fields are missing
3. No breaking changes for existing clients
