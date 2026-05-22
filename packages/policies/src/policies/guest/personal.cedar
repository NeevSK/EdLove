// Personal Workspace Policy
// Users have full permissions on their own PERSONAL workspace
permit(
  principal,
  action,
  resource
) when {
  principal.capacity == "member" &&
  resource.type == "User" &&
  resource.id == principal.id
};
