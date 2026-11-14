permit(
  principal,
  action,
  resource
) when {
  principal has capacity &&
  principal has school_id &&
  principal.capacity == "assistantPrincipal" &&
  resource has school_id &&
  resource.school_id == principal.school_id
};
