# Thuthimal (තුතිමල්) - Gratitude Economy

## Concept

**Thuthimal** (තුතිමල්) means "Flower of Gratitude" in Sinhala. It is Gurudevi's unique mechanism that transforms subscription economics into a gratitude economy. 

At its core, Thuthimal is rooted in a deeply human reality: in every culture, we celebrate and gift our teachers. Each of us has a small handful of teachers who touched our hearts and souls—those rare, life-shaping relationships that Buber would call "divine encounters." Even if recognized retrospectively, these encounters leave a permanent mark on both teacher and student.

As past students who want to offer gratitude to the educators who shaped our lives, Thuthimal provides a direct way to honor them. By purchasing a Pro subscription for a teacher, users support the actual infrastructure and monetary costs of the app, transforming a traditional software utility fee into a meaningful, cross-generational gift of care.

## How It Works

### For Gifters
- Anyone can gift a Pro subscription to a teacher (past students, alumni, or school communities).
- It is born out of a desire to say: *"You touched my life, and I remember."*
- The gifter's name and a personal message are shared with the teacher (or can be kept Anonymous).
- Recognizes teaching as sacred, life-shaping work deserving reciprocal care across time.

### For Recipients
- The teacher receives the Pro subscription as a gift, ensuring they have full access without financial burden.
- A beautiful, non-intrusive Thuthimal badge is displayed on their Profile and Self screens.
- They see a message: *"Your Pro subscription is a gift of gratitude (තුතිමල්) from [name]"* alongside any personal note of thanks.
- Honors the long-term, lasting impact they have made on their students' lives.

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

This is not just a payment model. It is a structured gratitude economy that:
- **Honors Life-Shaping Encounters**: Formally celebrates the small group of teachers who leave an indelible mark on their students' hearts and souls.
- **Enables Retrospective Gratitude**: Allows past students to express gratitude and pay it forward long after they have left the classroom.
- **Funds the Ecology Sustainably**: Connects the real monetary costs of running the platform (servers, development) directly to the gratefulness of the community, shielding teachers from the cost.
- **Transforms Transactional Economics**: Replaces standard SaaS billing with a culture of mutual care and gifting.

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
