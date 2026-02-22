Feature: Guest User Onboarding
  As a first-time user
  I want to explore the app without creating an account
  So that I can decide if Gurudevi is right for me

  Background:
    Given I am a new user opening the app for the first time
    And I am on a low-end Android device with 3G internet

  Scenario: Exploring as Guest with Clear Messaging
    When I see the Welcome Screen
    Then I should see the app logo
    And I should see a heading "Gurudevi"
    And I should see a subtitle "Education Born with love, Given with love"
    And I should see a privacy checkbox that is checked by default
    And I should see a primary button "Explore as Guest"
    And I should see a secondary button "I have an account - Log In"

  Scenario: Starting Guest Session
    Given I have accepted the privacy policy
    When I press "Explore as Guest"
    Then I should see a loading message "Opening Sanctuary..."
    And an anonymous session should be created
    And I should be redirected to the Onboarding Screen within 5 seconds

  Scenario: Privacy Policy Enforcement
    Given the privacy checkbox is unchecked
    When I try to press "Explore as Guest"
    Then the button should be disabled
    And the button should appear grayed out

  Scenario: Returning to Login
    When I press "Already have an account? Log In"
    Then I should see the Auth Screen
    And I should see options for Email and Google login
