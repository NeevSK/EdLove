Feature: Subject Teacher Joining
  As a Subject Teacher
  I want to join a classroom managed by another teacher
  So that I can deliver my specific subject content

  Background:
    Given I have completed my profile with name and role "teacher"
    And I am logged into the Gurudevi mobile app
    And I am affiliated with "Wisdom Academy" school

  Scenario: Joining a classroom as a subject teacher
    When I search for classroom "Grade 10 - Science"
    And I select "Join as Subject Teacher"
    And I select my subject as "Physics"
    And I click "Send Request"
    Then the Class Teacher should receive a notification for my "Physics Teacher" join request

  Scenario: Class Teacher approves subject teacher
    Given "Grade 10 - Science" has a pending request from me for "Physics"
    When the Class Teacher approves my request
    Then I should be added to the classroom as a "Subject Teacher"
    And I should be tagged as "Physics" in the classroom group
    And I should have "EXECUTION" permissions for Physics-related modules
