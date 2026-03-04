$base = "c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\supabase\migrations"
Set-Location $base

$pairs = @(
  @("20260215_create_manifestos.sql",               "20260215102312_create_manifestos.sql"),
  @("20260216000000_fix_schools_schema.sql",         "20260215122427_fix_schools_schema_v2.sql"),
  @("20260217_add_self_section_tables.sql",          "20260217180925_add_journal_entries_and_students.sql"),
  @("20260218_fix_rls_privilege_escalation.sql",     "20260217192416_fix_rls_privilege_escalation.sql"),
  @("20260218_fix_rls_insert_vulnerabilities.sql",   "20260217193045_fix_rls_insert_vulnerabilities.sql"),
  @("20260226_add_thuthimal_gifts_table.sql",        "20260228105048_add_thuthimal_gifts_table.sql"),
  @("20260228_academic_year.sql",                    "20260228105055_academic_year_dimensions.sql"),
  @("20260228_classroom_notes.sql",                  "20260228105056a_classroom_and_social_features.sql"),
  @("20260228_group_messages.sql",                   "20260228105056b_group_messages.sql"),
  @("20260228_principal_notes.sql",                  "20260228105056c_principal_notes.sql"),
  @("20260228_community_group_enhancements.sql",     "20260302093414_community_group_enhancements.sql"),
  @("20260228_notification_triggers.sql",            "20260302093440_notification_triggers.sql"),
  @("20260228_orientation_seeds.sql",                "20260302093454_orientation_seeds.sql"),
  @("20260228_notifications.sql",                    "20260228110000_notifications_table.sql"),
  @("20260228_staff_management.sql",                 "20260302094129_staff_management_alignment.sql"),
  @("20260301_submissions_graded_at.sql",            "20260302093429_submissions_graded_at.sql"),
  @("20260301_submissions_rls.sql",                  "20260302093635_submissions_rls_fixed.sql"),
  @("20260302_increment_growth_dimension.sql",       "20260302110000_increment_growth_dimension_local_v1.sql"),
  @("20260302_library_alignment.sql",                "20260302094048_library_alignment_v3.sql")
)

foreach ($pair in $pairs) {
  $src = $pair[0]
  $dst = $pair[1]
  if (Test-Path $src) {
    if (-not (Test-Path $dst)) {
      Rename-Item -Path $src -NewName $dst
      Write-Host "RENAMED: $src -> $dst"
    } else {
      Write-Host "SKIP (dst exists): $dst"
    }
  } else {
    Write-Host "MISSING src: $src"
  }
}

Write-Host ""
Write-Host "=== Final file list ==="
Get-ChildItem -Name "*.sql" | Sort-Object
