Feature: Onboarding Adapts to Device Constraints
  As a user on a low-end device
  I want the onboarding to be performant
  So that I don't experience lag or crashes

  Scenario: Low-End Device Optimization
    Given I am on a device with 2GB RAM
    When I navigate through onboarding steps
    Then progress animations should use simple opacity transitions
    And there should be no blur effects
    And images should be compressed
    And each step should load within 1 second

  Scenario: Offline Onboarding
    Given I have started onboarding
    And I have entered my name and role
    When my internet connection drops
    Then I should still be able to navigate through tour screens
    And I should see an offline indicator
    And I should be able to complete onboarding when connection returns

  Scenario: Slow Network Handling
    Given I am on a 3G connection
    When I complete the onboarding and create my workspace
    Then the workspace creation should show a loading state
    And it should complete within 10 seconds
    Or show a retry option if it fails
