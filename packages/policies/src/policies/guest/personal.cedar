// Personal Workspace Policy
// Users have full permissions on their own PERSONAL workspace
permit(
  principal,
  action,
  resource
) when {
  principal has capacity &&
  principal.capacity == "member" &&
  resource has type &&
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
  principal has capacity &&
  principal.capacity != "wanderer"
};

