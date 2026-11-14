permit(
  principal,
  action,
  resource
) when {
  principal has capacity &&
  principal has school_id &&
  principal.capacity == "principal" &&
  resource has school_id &&
  resource.school_id == principal.school_id
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"delete"],
  resource
) when {
  principal has capacity &&
  principal.capacity == "principal" &&
  resource is ManifestoEndorsement &&
  resource has user_id &&
  resource.user_id == principal.id
};
