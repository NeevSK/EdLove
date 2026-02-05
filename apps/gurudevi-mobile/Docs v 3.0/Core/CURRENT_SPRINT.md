# CURRENT SPRINT
## What's Happening Right Now

05/02/2026
1. i finished lot of things 04/02/2026
2. now i m thinking about user roles, price tiers and gift codes(or qr codes) for users and may be potentially rewards mechanisms too. eventhough i have decided on feb 2 i feel we can add subtle non intrusive rewards system to encourage usersa and rewards are inherent human mechanism
3.0 i need to implement library section and its kind of bespoke to my own vision eventhough teachers might not use it. in library there are several things to be implemented.
3.1 first it has personal desk for teachers which they create in classroom section and keep in personal desk and i think teachers can get from public library and keep there too
3.2 in public librarry notes, lesson plans, papers, other books, movies(inspirational - at least trailors), then real stories and photos videos, maps and visualizations, then government or education related circulars, news updates and other important documents
3.3 teachers can share own things too
3.4 then some likes or uptoves or most used or famous kind of docs and even here we can give teachers rewards for their contubutions etc
3.5 then we can have a search bar to search for anything in library based on subjects, grades, interests etc

4.0 in community, what matters to me is fix broken information loop than try to bypass existing chat apps.
4.1 first one is announcements from principal or teachers then group or community can even react or polls. may be add some forms too
4.2 anonymous posts, groups or voting or polls, forms etc
4.3 then we can have a search bar to search for anything in community based on subjects, grades, interests etc
4.4 then may be add images in first phase is enough and i think we can work based on user feedback


## Changed My Mind Recently

**What I decided to change/remove/add and why**:

**Example**:
```markdown
- ~~Rewards system~~ → DELETED (Feb 2)
  Reason: Not aligned with teacher-centric focus. Teachers don't need gamification.
  
- ~~Maps integration~~ → DELETED (Feb 2)
  Reason: Too small a feature to mention in architecture. Can add later if needed.
  
- Pricing tiers → MOVED to v0.1 (was v0.5) (Feb 2)
  Reason: Revenue = sustainability. Can't wait 6 months. Need PayHere integration now.
  
- Multi-language → CONFIRMED for v0.1 (Feb 2)
  Reason: Si/Ta/En must be from day 1, non-negotiable.
```

---

## Questions for AI

**Things I'm unsure about and need help with**:

**Example**:
```markdown
- How to implement RLS policies for student/teacher/principal roles?
  (Need to ensure students only see their enrolled classrooms)
  

  
- How to handle offline data when user has no internet for days?
  (Queue mechanism? Timestamp-based sync? Conflict resolution?)
```

---

## Discoveries This Week

**Things I learned while building** (update as you go):

**Example**:
```markdown
- Teachers want voice input more than typing (exhausted fingers)
  → Need to prioritize voice recording in Self section
  
- Lotus breathing animation too heavy on 2GB devices
  → Implemented device tier detection, disabled on low-end
  
- "Data saver mode" highly requested
  → Need toggle in settings to reduce image quality/bandwidth
  
- Sinhala text needs 1.8x line height (more vertical space than English)
  → Updated typography system
```

---

## Blockers / Issues

**Things preventing progress** (so you can get help or note for later):

**Example**:
```markdown
- Supabase RLS policy not working for principals
  Status: Debugging, might need to restructure policy
  
- PayHere test mode API not responding
  Status: Waiting for support ticket response
  
- Low-end device emulator crashing on startup
  Status: Need to set up different emulator config
```

---

## Next Week (Probably)

**What I'm thinking of tackling next** (this will likely change):

**Example**:
```markdown
- Build Self section (mood check-in, reflection journal)
- Create Classroom basics (create classroom, upload PDF)
- Add Community announcements (principal post, all read)
- Start Profile section (basic settings, language toggle)

(This will change as I spiral - that's okay!)
```

---

## Notes to Self

**Random thoughts, ideas, or reminders**:

**Example**:
```markdown
- Remember: Teacher is primary user, not student
- Lotus petal FAB = context-aware floating action button
- Keep checking NORTH_STAR.md when tempted to add features
- No guilt mechanics (no streaks, no pressure)
- Test on 2GB RAM device before committing
```

---

## Version Context

**For reference** (what version are we building toward?):

**v0.1** (Current target):
- Auth (email/password)
- Self: Mood check-in, reflection journal
- Classroom: Create lesson, upload PDF, basic assignments
- Community: Announcements (principal post, all read)
- Library: 20 curated resources, basic upload
- Profile: Settings, language toggle
- Multi-language (Si/Ta/En)
- Pricing tiers (free/pro/premium structure, PayHere integration)
- Lotus petal FAB (floating action button)

**v1.0** (Future):
- Offline mode (SQLite + Drizzle sync)
- AI assistant (Claude API, Pro/Premium only)
- Full Community (forums, replies, mentorship)
- Full Library (search, quizzes, interactive lessons)
- Video calls

---

## How to Use This Document

**Daily**:
1. Start day: Read "This Week's Focus"
2. Work on tasks
3. Update "Discoveries" as you learn
4. Cross off completed tasks

**When Spiraling** (changing direction):
1. Update "Changed My Mind Recently"
2. Update "This Week's Focus" with new direction
3. Move old tasks to "Next Week" or delete

**When Stuck**:
1. Add to "Questions for AI"
2. Add to "Blockers / Issues"
3. Read NORTH_STAR.md to refocus

**Weekly**:
1. Review what got done
2. Plan "Next Week"
3. Archive old "Changed My Mind" entries if too long

---

**Template Usage**: Copy this structure each week, fill in brackets, update as you go.

**The spiral is not a bug, it's your process. This document tracks it.**
