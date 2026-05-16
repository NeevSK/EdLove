Feature: Invitation Welcome Flow

  As a new user arriving via a selective deep-link invitation
  I want to see a personalized welcome screen
  So that I understand my capacity and the community I am joining

  Scenario: Arriving via Teacher invitation
    Given I have a deep-link invitation for a "teacher" capacity in "Galle International School"
    When I open the app via the invitation link
    Then I should see a welcome message "Welcome to Galle International School"
    And I should see my invited capacity as "Teacher"
    And I should see a button to "Join the Sanctuary"

  Scenario: Accepting an invitation
    Given I am on the invitation welcome screen for "Teacher" in "Galle International School"
    When I press "Join the Sanctuary"
    Then I should be redirected to the "Main" screen
    And my capacity should be saved as "Teacher" in the database
