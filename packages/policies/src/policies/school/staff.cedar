// Read own StaffLeave only (known leak fix)
permit(
  principal,
  action == Action::"read",
  resource
) when {
  principal.capacity == "staff" &&
  resource is StaffLeave &&
  resource has user_id &&
  resource.user_id == principal.id
};
