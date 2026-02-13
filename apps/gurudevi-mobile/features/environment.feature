Feature: Environment Engine - Adaptive App Behavior
  As a Gurudevi user
  I want the app to adapt to my context (time, device, role, language)
  So that I have an optimal and contextual experience

  # ============================================================================
  # Temporal Theme (Time-Aware)
  # ============================================================================

  Scenario: Dawn theme activation
    Given the current time is 5:30 AM
    And the user has theme mode set to "auto"
    When the app loads
    Then the theme should be "dawn"
    And the primary colors should have warm, gentle tones

  Scenario: Day theme activation
    Given the current time is 11:00 AM
    And the user has theme mode set to "auto"
    When the app loads
    Then the theme should be "day"
    And the interface should be bright and energetic

  Scenario: Evening theme activation
    Given the current time is 6:00 PM
    And the user has theme mode set to "auto"
    When the app loads
    Then the theme should be "evening"
    And the colors should be warmer and softer

  Scenario: Night theme activation
    Given the current time is 10:00 PM
    And the user has theme mode set to "auto"
    When the app loads
    Then the theme should be "night"
    And the interface should use dark, muted tones

  Scenario: User overrides automatic theme
    Given the current time is 10:00 PM
    And the temporal theme would be "night"
    When the user sets theme mode to "light"
    Then the theme should be "light"
    And the temporal phase should not affect the theme

  # ============================================================================
  # Role-Based View Adaptation
  # ============================================================================

  Scenario: Teacher views Classroom tab
    Given the user role is "teacher"
    When they navigate to the Classroom tab
    Then they should see "Create Lesson" action
    And they should see their assigned classes
    And they should see student support signals

  Scenario: Student views Classroom tab
    Given the user role is "student"
    When they navigate to the Classroom tab
    Then the "Create Lesson" action should be hidden
    And they should see their enrolled classes
    And they should see available learning resources

  Scenario: Principal views Classroom tab
    Given the user role is "principal"
    When they navigate to the Classroom tab
    Then they should see ecosystem health metrics
    And they should see all sections overview
    And they should see support signals from teachers

  Scenario: Founder views Self tab
    Given the user role is "founder"
    When they navigate to the Self tab
    Then they should see "Creator Reflection" instead of "Teacher Reflection"
    And they should see system-wide metrics

  # ============================================================================
  # Reality Detection (Hardware/Network Constraints)
  # ============================================================================

  Scenario: Low-end device with auto fidelity
    Given the device has less than 3GB RAM
    And visual fidelity is set to "auto"
    When the app loads
    Then glassmorphism effects should be disabled
    And blur effects should be replaced with solid backgrounds
    And complex animations should be simplified

  Scenario: User overrides low-fidelity mode
    Given the device has less than 3GB RAM
    And visual fidelity was auto-set to "low"
    When the user manually sets fidelity to "high"
    Then glassmorphism effects should be enabled
    And all visual effects should be active

  Scenario: Poor network connection detected
    Given the network connection is slow (< 1 Mbps)
    When the app detects the network state
    Then "Data Saver" mode should activate automatically
    And image quality should be reduced
    And video autoplay should be disabled

  Scenario: Network connection restored
    Given the app is in "Data Saver" mode
    When the network connection improves (> 5 Mbps)
    Then "Data Saver" mode should deactivate
    And normal quality content should be restored

  Scenario: Offline mode activation
    Given the user has no internet connection
    When the app checks network status
    Then "Offline Sovereignty" mode should activate
    And only cached content should be accessible
    And a gentle offline indicator should be visible

  # ============================================================================
  # Language Support
  # ============================================================================

  Scenario: User switches to Sinhala
    Given the app language is "English"
    When the user changes language to "Sinhala"
    Then all interface text should update to Sinhala
    And the appropriate Noto Sans Sinhala font should be used
    And line height should increase to 1.8 for readability

  Scenario: User switches to Tamil
    Given the app language is "English"
    When the user changes language to "Tamil"
    Then all interface text should update to Tamil
    And the appropriate Noto Sans Tamil font should be used
    And line height should increase to 1.8 for readability

  # ============================================================================
  # Visual Fidelity Control
  # ============================================================================

  Scenario: User opens App Settings
    Given the user is on the Profile tab
    When they tap on "App Settings"
    Then they should see Theme control (Auto/Light/Dark)
    And they should see Language selector (English/Sinhala/Tamil)
    And they should see Visual Fidelity toggle (Auto/Low/High)
    And they should see Font Size adjustment

  # ============================================================================
  # Combined Scenarios (Integration)
  # ============================================================================

  Scenario: Perfect storm - Low-end device at night with poor network
    Given the device has 2GB RAM
    And the current time is 11:00 PM
    And the network connection is slow
    And the user role is "teacher"
    When the app loads
    Then the theme should be "night" with minimal effects
    And visual fidelity should be "low"
    And "Data Saver" mode should be active
    And only essential teacher features should load
    And the interface should remain responsive
