// AI is an authenticated, capacity-scoped operation. Commercial entitlement
// remains a separate gate owned by the entitlement authority.
permit(
  principal,
  action == Action::"use_ai",
  resource is AIAssistant
) when {
  principal has capacity &&
  principal.capacity != "wanderer"
};
