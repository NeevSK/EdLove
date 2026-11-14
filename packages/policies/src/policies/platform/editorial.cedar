// Authenticated contributors may create a submission only for themselves.
permit(
  principal,
  action in [Action::"create", Action::"read"],
  resource
) when {
  resource is EditorialSubmission &&
  resource has submitter_id &&
  resource.submitter_id == principal.id &&
  principal has capacity &&
  principal.capacity != "wanderer"
};
