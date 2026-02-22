Feature: Teacher School Joining
  As a Teacher
  I want to join a school sanctuary
  So that I can eventually create and manage classroom sanctuaries

  Background:
    Given I have completed my profile with name and role "teacher"
    And I am logged into the Gurudevi mobile app
    And I do not currently belong to any school

  Scenario: Searching and requesting to join a school
    When I search for a school named "Wisdom Academy"
    Then I should see "Wisdom Academy" in the results
    When I select "Wisdom Academy" and click "Request to Join"
    Then I should see a confirmation that my request has been sent to the Principal
    And my status should remain "pending" for "Wisdom Academy"

  Scenario: Principal approves join request
    Given I have a "pending" join request for "Wisdom Academy"
    When the Principal "venerable-ananda" approves my request
    Then I should receive a notification "Welcome to Wisdom Academy"
    And I should be able to access the "Wisdom Academy" school dashboard

  Scenario: Principal rejects join request
    Given I have a "pending" join request for "Wisdom Academy"
    When the Principal "venerable-ananda" rejects my request
    Then I should receive a notification "Join request for Wisdom Academy rejected"
    And I should be redirected back to the school search screen
