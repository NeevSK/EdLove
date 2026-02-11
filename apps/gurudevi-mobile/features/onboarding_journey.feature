Feature: Onboarding Journey
  As a new user
  I want to complete or skip onboarding
  So that I can access the main application features

  Scenario: User skips onboarding
    Given I am on the "Welcome to Gurudevi" screen
    When I press the "Skip" button
    Then I should be navigated to the Home Screen
    And my onboarding status should be marked as completed
    And I should see the "Warm Welcome" modal

  Scenario: User completes onboarding normally
    Given I am on the last onboarding screen
    When I press the "Complete" button
    Then I should be navigated to the Home Screen
    And I should see the "Warm Welcome" modal

  Scenario: Returning user (already onboarded)
    Given I have previously completed onboarding
    When I open the app
    Then I should be on the Home Screen
    And I should NOT see the "Warm Welcome" modal
    And I should see the Mood Check
