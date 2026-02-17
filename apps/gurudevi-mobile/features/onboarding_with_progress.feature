Feature: Onboarding Journey with Visual Progress
  As a guest user
  I want to see my progress through onboarding
  So that I know how many steps remain

  Background:
    Given I have started as a guest
    And I am on the Onboarding Screen

  Scenario: Name Input with Progress Indicator
    When I am on Step 1 (Name)
    Then I should see a progress indicator showing "Step 1 of 8"
    And I should see 8 progress dots
    And the first dot should be highlighted
    And I should see a heading "Welcome! What should we call you?"
    And I should see an input field with placeholder text
    And the Continue button should be disabled until I enter a name

  Scenario: Completing Name Step
    Given I am on Step 1 (Name)
    When I enter "Naween" in the name field
    Then the Continue button should become enabled
    When I press Continue
    Then I should move to Step 2 (Role)
    And the progress indicator should show "Step 2 of 8"
    And the second dot should be highlighted

  Scenario: Role Selection
    Given I am on Step 2 (Role)
    When I see the role dropdown
    Then "Teacher" should be selected by default
    And I should see options: Teacher, Student, Principal, Admin, Founder
    When I select "Student"
    And I press Continue
    Then I should move to Step 3 (Tour: Philosophy)

  Scenario: Sanctuary Tour with Visual Icons
    Given I am on Step 3 (Philosophy Tour)
    Then I should see a large emoji icon "🪷"
    And I should see a heading with the tour title
    And I should see a subtitle
    And I should see descriptive content
    And I should see a "Back" button
    And I should see a "Next" button
    And I should see a "Skip" link

  Scenario: Skipping Tour
    Given I am on Step 3 (Philosophy Tour)
    When I press "Skip"
    Then I should jump to Step 8 (Auth/Completion)
    And the progress indicator should show "Step 8 of 8"

  Scenario: Completing Tour
    Given I am on Step 7 (Final Tour Screen)
    When I press "Next"
    Then I should move to Step 8 (Auth/Completion)
    And I should see options to create an account or continue as guest
