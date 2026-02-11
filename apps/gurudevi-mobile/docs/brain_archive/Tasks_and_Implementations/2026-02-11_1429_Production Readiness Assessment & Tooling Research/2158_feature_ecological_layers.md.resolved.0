# Feature: Ecological Systems Refinement
**Philosophy**: Bronfenbrenner's Ecological Layers (Microsystem to Macrosystem)
**Principles**: Guided Discovery, Universal Discoverability, Sovereign Prioritization

**Background**:
  **Given** the user is authenticated with a valid role (Principal or Teacher)
  **And** the user is in the "Alpha/Invite-Only" environment
  **And** the "Alpha Pathfinders" (Global Community) is visible to all

### Scenario: Universal QR Discoverability (Portals)
  **Given** the user is on the "School Dashboard" OR "Classroom Dashboard"
  **When** the user taps the "Portal" (QR) icon in the top header
  **Then** a "Sovereign Portal" modal should slide up
  **And** it should display a unique QR code for that specific ecological layer
  **And** the user should see options to "Share Portal Link" and "Download Portal Image"
  **And** a "Help" tip should explain: "Anyone who scans this portal joins your community instantly."

### Scenario: School Branding (Logo Upload)
  **Given** the Principal is on the "School Settings" screen
  **And** the school "Royal College" has been created
  **When** the user taps "Upload School Logo"
  **And** selects a valid image file
  **Then** the image should be optimized for mobile display
  **And** the "Royal College" logo should be updated across all school-wide tiles
  **And** a "Success" micro-animation should confirm the branding is live

### Scenario: Managing Community Priority (Pinning/Archiving)
  **Given** the user has joined multiple groups (e.g., "Alpha Pathfinders", "School News", "Grade 10-A")
  **When** the user long-presses the "Grade 10-A" group tile
  **And** selects "Pin to Top"
  **Then** "Grade 10-A" should move to the "Pinned" section at the top of the Library
  **When** the user long-presses "Alpha Pathfinders"
  **And** selects "Archive Group"
  **Then** the group should be moved to the "Archived" section
  **And** it should no longer clutter the primary "Active Communities" view
  **But** the user can still access it via the "Archived" tab

### Scenario: Guided Empty States (Microsystem Initiation)
  **Given** a Teacher has joined a School but has no Classrooms
  **When** they navigate to the "Classroom" section
  **Then** they should see a "Guided Empty State":
    - Illustration: A seeds sprouting in a glass sanctuary
    - Message: "Every great lesson starts with a single room."
    - Action: A prominent "Create your first Classroom" button
  **And** the background should reflect the "Microsystem" (Green/Earthly) color palette
