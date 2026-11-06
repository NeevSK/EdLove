// Platform Administrators and Sovereign Stewards (founder, coFounder, director)
permit(
  principal,
  action in [Action::"read", Action::"create", Action::"update", Action::"delete"],
  resource
) when {
  principal has capacity &&
  (principal.capacity == "admin" ||
   principal.capacity == "founder" ||
   principal.capacity == "coFounder" ||
   principal.capacity == "director")
};
