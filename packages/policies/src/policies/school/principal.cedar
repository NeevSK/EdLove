permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "principal" &&
  resource has school_id &&
  resource.school_id == principal.school_id
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"delete"],
  resource
) when {
  principal.capacity == "principal" &&
  resource is ManifestoEndorsement &&
  resource.user_id == principal.id
};
