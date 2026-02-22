Feature: Community Group Member Management
  As a Group Owner (Principal or Class Teacher)
  I want to manage members and joining policies
  So that I can maintain the safety of the sanctuary

  Background:
    Given I am the owner of the community group "Grade 10 Science"
    And the current joining policy is "restricted"

  Scenario: Approving a pending member
    Given "Student A" has requested to join "Grade 10 Science"
    When I view the "Member Management" screen for "Grade 10 Science"
    Then I should see "Student A" in the pending requests list
    When I click "Approve" for "Student A"
    Then "Student A" should be added to the members list
    And "Student A" should receive a notification "Your request to join Grade 10 Science has been approved"

  Scenario: Switching joining policy to "Open"
    When I navigate to "Group Settings" for "Grade 10 Science"
    And I change the joining policy to "open"
    Then users should be able to join "Grade 10 Science" without approval
    And existing pending requests should be automatically approved

  Scenario: Bulk approving members
    Given there are multiple pending requests for "Grade 10 Science"
    When I click "Approve All" on the Member Management screen
    Then all pending users should become members
