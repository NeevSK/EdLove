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

// General User Profile Access Policy
// All authenticated users can read/update their own User resource
permit(
  principal,
  action in [Action::"read", Action::"update"],
  resource
) when {
  resource is User &&
  resource.id == principal.id &&
  principal.capacity != "wanderer"
};

