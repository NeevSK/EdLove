permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "assistantPrincipal" &&
  resource has school_id &&
  resource.school_id == principal.school_id
};
