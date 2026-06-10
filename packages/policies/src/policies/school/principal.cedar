permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "principal" &&
  resource has school_id &&
  resource.school_id == principal.school_id
};
