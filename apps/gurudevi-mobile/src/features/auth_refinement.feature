Feature: Auth Refinement
  Assisting users with account discovery and role initialization

  Scenario: Attempting signup with an existing email
    Given I am a user with an existing account "test@example.com"
    And I am on the "SignUp" screen
    When I enter email "test@example.com" and a password
    And I press "Sign Up"
    Then the system should detect that the account already exists
    And I should see a message "You already have an account! Switching to login..."
    And the screen should automatically switch to "Login" mode
    But the email "test@example.com" should still be in the input field

  Scenario: Initializing as a Founder during onboarding
    Given I have successfully signed up as a new user
    And I am on the first onboarding screen
    When I enter my name "Sovereign Founder"
    And I select the role "Founder"
    And I complete the onboarding
    Then my profile in the database should be updated with role "founder"
    And I should be redirected to the "Main" sanctuary view
