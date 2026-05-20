// Read only School info (wanderer has very limited access)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "wanderer" &&
  resource is School
};
