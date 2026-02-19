# Frictionless User Onboarding Strategy

## Overview
The Gurudevi onboarding process is designed to be **progressive and context-aware**, allowing users to start using the app immediately while gradually building their complete profile.

## Onboarding Philosophy

### Core Principles
1. **Instant Value**: Users can start using core features immediately
2. **Progressive Disclosure**: Ask for information only when needed
3. **Context-Aware**: Different flows for different roles
4. **Zero Frustration**: No mandatory fields blocking initial access
5. **QR Code Magic**: Enable instant school joining via QR scanning

## Onboarding Flows

### 1. Quick Start Flow (5 seconds)
**Goal**: Get user into the app ASAP

```
Step 1: Authentication Method Selection
- Continue with Google (recommended)
- Continue with Apple
- Use Email/Password
- [Small text] Scan School QR Code →

Step 2: Role Selection (Only if email/password)
- Student
- Teacher
- Principal
[Auto-skip if using OAuth with role in metadata]

Step 3: Welcome Screen
- "Welcome to Gurudevi Sanctuary"
- Brief animation (2s max)
- Auto-navigate to main app
```

**Result**: User is in the app in 5-10 seconds

### 2. Progressive Profile Building

#### Phase 1: Essential Info (Day 1)
Collected passively during first use:
- Full name (from OAuth or auth)
- Role (selected or from OAuth)
- Email (from auth)

#### Phase 2: School Connection (Days 1-3)
Prompted when relevant:
- **For Principals**: "Create your school" (optional)
- **For Teachers**: "Join a school via invite code" (optional)
- **For Students**: "Scan your school's QR code" (optional)

**Trigger Points**:
- When viewing classroom tab
- When trying to create a class
- Gentle reminder after 3 days

#### Phase 3: Profile Enhancement (Days 3-7)
Prompted contextually:
- Phone number: When trying to invite others
- Profile photo: When viewing own profile
- Bio: When profile is viewed by others
- Language preference: When first opening app

#### Phase 4: Feature Discovery (Week 1-2)
In-app tooltips and gentle guidance:
- Self screen features
- Library resources
- Community posts
- QR code sharing

## QR Code Strategy

### School QR Codes
**Use Cases**:
1. **Student Enrollment**: Scan school QR → instant join
2. **Teacher Joining**: Scan school QR → request access
3. **Profile Sharing**: Scan user QR → add connection

### Implementation

#### Principal Creates School QR
```typescript
// Generated when school is created
const schoolQRData = {
  type: 'school',
  schoolId: school.id,
  schoolName: school.name,
  inviteCode: generateInviteCode()
};

// QR code can be:
- Printed and displayed at school entrance
- Shared digitally via WhatsApp/Email
- Displayed on school website
```

#### User Scans QR Code
```typescript
// From Camera or Image
const scannedData = parseQRCode(qrData);

if (scannedData.type === 'school') {
  // Show school preview
  showSchoolPreview(scannedData);
  
  // Auto-join based on role
  if (userRole === 'student') {
    // Direct join (no approval needed)
    joinSchool(scannedData.schoolId);
  } else if (userRole === 'teacher') {
    // Request approval
    requestSchoolAccess(scannedData.schoolId);
  }
}
```

#### Personal Identity QR
Each user has a personal QR code (shown on profile card back):
- Contains: User ID, name, role
- Use case: Quick friend/colleague connections
- Privacy: Only basic info, requires mutual consent

## Profile Completion Gamification

### Completion Score System
Already implemented in `ProfileCompletionBar.tsx`:

**Weighted Fields**:
- Avatar: 20%
- Bio: 20%
- Email: 15%
- Name: 15%
- Phone: 15%
- School: 10%
- Role: 5%

**Incentives**:
- Visual progress ring on profile card
- "Complete your profile" nudges
- Unlock features at certain thresholds:
  - 50%: Can join classes
  - 70%: Can create resources
  - 90%: Can invite others
  - 100%: Special "Verified Guru" badge

## Onboarding UI Components

### 1. Welcome Screen
```tsx
<Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
  <Center sx={{ flex: 1 }}>
    <VStack space="2xl" alignItems="center">
      {/* Lotus Animation */}
      <LottieView source={lotusBloom} autoPlay loop={false} />
      
      <VStack space="sm" alignItems="center">
        <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
          Welcome to Gurudevi
        </Heading>
        <Text color={Theme.colors.mistGray} size="lg" textAlign="center">
          Your sanctuary for mindful teaching & learning
        </Text>
      </VStack>
    </VStack>
  </Center>
</Box>
```

### 2. QR Scanner Modal
```tsx
<Modal visible={showScanner}>
  <Camera>
    <Overlay>
      <Text>Scan School QR Code</Text>
      <Box sx={scannerFrame} />
      <Text>Or enter invite code manually</Text>
      <Input />
    </Overlay>
  </Camera>
</Modal>
```

### 3. Profile Completion Prompt
```tsx
<Box sx={profileCompletionCard}>
  <HStack space="md" alignItems="center">
    <CircularProgress value={70} />
    <VStack>
      <Text bold>Complete Your Profile</Text>
      <Text size="sm">Add phone & bio to unlock features</Text>
    </VStack>
    <ChevronRight />
  </HStack>
</Box>
```

### 4. Feature Discovery Tooltips
```tsx
<Tooltip
  content="Tap to log your mood"
  visible={firstTimeUser && tab === 'self'}
  placement="bottom"
>
  <FeatureButton />
</Tooltip>
```

## Implementation Phases

### Phase 1: Immediate (This PR)
- [x] Role-based dynamic routing
- [x] Profile completion tracking
- [x] Progressive profile editing (phone, bio fields)
- [ ] QR code generation for users (already exists)

### Phase 2: Week 1
- [ ] QR code scanner for schools
- [ ] Invite code system
- [ ] School joining flow
- [ ] Profile completion prompts

### Phase 3: Week 2
- [ ] Feature discovery tooltips
- [ ] Onboarding walkthrough (optional)
- [ ] Achievement system for profile completion
- [ ] "Complete profile" incentives

### Phase 4: Week 3+
- [ ] Analytics tracking for onboarding funnel
- [ ] A/B testing different flows
- [ ] Referral system via QR codes
- [ ] Bulk school enrollment tools for admins

## Metrics to Track

### Onboarding Success Metrics
- **Time to First Value**: < 30 seconds
- **Day 1 Retention**: > 60%
- **Profile Completion Rate**: > 80% within 7 days
- **School Connection Rate**: > 70% within 3 days

### User Engagement Metrics
- **Daily Active Users (DAU)**
- **Feature Discovery Rate**: % of users using each tab
- **QR Code Scan Rate**: How many users successfully join via QR
- **Completion Funnel**: Drop-off at each onboarding step

## Error Handling & Edge Cases

### QR Code Fails
```typescript
try {
  const data = parseQRCode(qrData);
  joinSchool(data.schoolId);
} catch (error) {
  showToast({
    title: "Invalid QR Code",
    description: "Try scanning again or enter invite code manually",
    action: "Enter Code",
  });
}
```

### School Already Joined
```typescript
if (userSchools.includes(schoolId)) {
  showToast({
    title: "Already a Member",
    description: "You're already part of this school!",
    status: "info",
  });
  return;
}
```

### School Full / Access Denied
```typescript
if (school.maxStudents && school.currentStudents >= school.maxStudents) {
  showToast({
    title: "School is Full",
    description: "This school has reached maximum capacity",
    status: "warning",
  });
  return;
}
```

## Best Practices

### ✅ DO
- Allow skipping optional steps
- Save progress automatically
- Provide clear next steps
- Use celebratory animations for milestones
- Make QR codes easily accessible
- Support manual invite code entry as fallback

### ❌ DON'T
- Block users from using app features
- Ask for unnecessary information upfront
- Show too many tooltips at once
- Force users to complete profile immediately
- Make QR scanning the only option

## Future Enhancements

1. **Smart QR Codes**: QR codes with analytics tracking
2. **Bulk Enrollment**: Upload CSV of students to auto-generate invite links
3. **Parent Portal**: Separate onboarding for parents via student QR
4. **Multi-School Support**: Teachers working at multiple schools
5. **Guest Mode**: Try app without account (limited features)
6. **Voice Onboarding**: For accessibility (Sinhala/Tamil audio guide)

## Conclusion

This progressive onboarding strategy ensures:
- ✅ Users get value immediately
- ✅ Information is collected contextually
- ✅ QR codes enable frictionless joining
- ✅ Profile completion is incentivized, not forced
- ✅ Different roles have optimized flows
