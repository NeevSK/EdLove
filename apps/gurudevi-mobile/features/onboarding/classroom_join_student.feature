Feature: Student Classroom Joining
  As a Student
  I want to join a classroom sanctuary via QR code
  So that I can access my lessons and community

  Background:
    Given I have completed my profile with name and role "student"
    And I am logged into the Gurudevi mobile app
    And I am affiliated with "Wisdom Academy" school

  Scenario: Scanning a classroom QR code
    When I scan the QR code for "Grade 10 - Mathematics"
    Then I should see the classroom details and a "Send Join Request" button
    When I click "Send Join Request"
    Then I should see "Request Sent"
    And I should not see the classroom content yet

  Scenario: Class Teacher approves student request
    Given I have a "pending" join request for "Grade 10 - Mathematics"
    When the Class Teacher "sanduni-perera" approves my request
    Then I should receive a notification "You have been admitted to Grade 10 - Mathematics"
    And I should be automatically added to the classroom's community group "Math Sanctuary G10"
    And I should now see the classroom dashboard content
