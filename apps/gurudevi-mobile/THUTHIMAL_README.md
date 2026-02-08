# Thuthimal (තුතිමල්) - Gratitude Economy

## Concept

**Thuthimal** (තුතිමල්) means "Flower of Gratitude" in Sinhala. It's Gurudevi's unique feature that transforms subscription economics into a gratitude economy.

## How It Works

### For Gifters
- Anyone can gift a Pro subscription to a teacher
- Past students, alumni associations, or grateful communities
- Gifter's name is displayed (or can be "Anonymous")
- Recognizes teaching as sacred work deserving reciprocal care across time

### For Recipients
- Teacher receives Pro subscription as a gift
- Beautiful badge displayed in Profile and Self screens
- Message: "Your Pro subscription is a gift of gratitude (තුතිමල්) from [name]"
- Honors the long-term impact teachers have

## Implementation (Alpha)

### Database Fields
```sql
ALTER TABLE users 
  ADD COLUMN is_pro BOOLEAN DEFAULT false,
  ADD COLUMN is_thuthimal BOOLEAN DEFAULT false,
  ADD COLUMN thuthimal_gifter TEXT,
  ADD COLUMN thuthimal_gifted_at TIMESTAMPTZ;
```

### Manual Gifting (Alpha)
For Alpha, Thuthimal gifts are manually flagged by admins:

```sql
UPDATE users 
SET 
  is_pro = true,
  is_thuthimal = true,
  thuthimal_gifter = 'Past Students Association',
  thuthimal_gifted_at = NOW()
WHERE email = 'teacher@example.com';
```

### UI Components
- **Full Badge**: `ThuthimalBadge` component (Profile screen)
- **Compact Badge**: Small version (Self screen header)
- **Design**: Sanctuary aesthetic - warm cream background, ember orange accent

## Future (Beta)

### Automated Gifting
- Payment gateway integration (Stripe, local gateways)
- In-app interface to gift subscriptions
- Gift history and tracking
- Recipient notification system
- Multiple gifters support

### Web Portal
Simple webpage: "Gift Gurudevi Pro to a Teacher"
- Collect: teacher email/phone, gifter's name, message (optional)
- Payment processing
- Automatic account flagging

## Philosophy

This is not just a payment model. It's a gratitude economy that:
- Honors the long-term impact teachers have
- Allows past students to give back
- Makes visible the debt of care we owe educators
- Transforms subscription economics into gift economics
- Creates a culture of honoring educators beyond transactional payments

## Design Principles

- **Elegant**: Not flashy, but dignified
- **Warm**: Sanctuary colors (cream, ember orange)
- **Honoring**: Recognizes sacred work
- **Non-intrusive**: Visible but not dominating
- **Private**: Gifter name visible only to recipient

## Testing Thuthimal

To test Thuthimal in Alpha:

1. Run the migration: `20260208_add_thuthimal_fields.sql`
2. Manually flag a test account:
   ```sql
   UPDATE users 
   SET is_thuthimal = true, thuthimal_gifter = 'Test Gifter'
   WHERE email = 'test@example.com';
   ```
3. Log in as that user
4. See badge in Profile screen (full)
5. See badge in Self screen (compact, top-right)

---

**"Teaching is sacred work. Thuthimal honors that truth."**
