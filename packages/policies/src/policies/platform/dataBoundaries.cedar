// Explicit policy vocabulary for deployed tables that are not yet represented
// as first-class ZenStack models. ZenStack remains the object/data boundary;
// these Cedar rules provide the procedure-level authorization gate.

permit(
  principal,
  action in [Action::"read", Action::"create"],
  resource
) when {
  resource is PrivacyLedgerEntry &&
  resource has user_id &&
  resource.user_id == principal.id
};

// A school or platform role does not confer access to another person's ledger.
forbid(principal, action, resource) when {
  resource is PrivacyLedgerEntry &&
  (if resource has user_id then
    (resource.user_id != principal.id || !(action in [Action::"read", Action::"create"]))
   else true)
};

permit(principal, action == Action::"read", resource) when {
  resource is OperationReceipt && resource.account_id == principal.id
};

permit(
  principal,
  action == Action::"read",
  resource
) when {
  resource is FormTemplate && principal has capacity && principal.capacity != "wanderer"
};

// Student Potential is a private procedure surface. Cedar gates the
// authenticated school-facing roles; the handler then applies the precise
// student/classroom predicate and teacher-only upsert check.
permit(
  principal,
  action in [Action::"read", Action::"update"],
  resource
) when {
  resource is Student &&
  principal has capacity &&
  (principal.capacity == "teacher" ||
   principal.capacity == "principal" ||
   principal.capacity == "assistant_principal" ||
   principal.capacity == "section_head" ||
   principal.capacity == "grade_head" ||
   principal.capacity == "admin")
};

permit(
  principal,
  action == Action::"read",
  resource
) when {
  resource is Student &&
  principal has capacity &&
  principal.capacity == "student" &&
  resource.id == principal.id
};

permit(
  principal,
  action in [Action::"create", Action::"update", Action::"delete"],
  resource
) when {
  resource is FormTemplate && resource has owner_id && resource.owner_id == principal.id
};

permit(
  principal,
  action in [Action::"read", Action::"update", Action::"delete"],
  resource
) when {
  resource is Notification &&
  resource has user_id &&
  resource.user_id == principal.id &&
  principal has capacity &&
  principal.capacity != "wanderer"
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"update", Action::"delete"],
  resource
) when {
  resource is PrincipalNote &&
  resource has author_id &&
  resource.author_id == principal.id &&
  resource has school_id &&
  principal has school_id &&
  resource.school_id == principal.school_id
};

permit(
  principal,
  action == Action::"read",
  resource
) when {
  resource is Announcement &&
  resource has school_id &&
  principal has school_id &&
  resource.school_id == principal.school_id &&
  principal has capacity &&
  principal.capacity != "wanderer"
};

permit(
  principal,
  action in [Action::"create", Action::"update", Action::"delete"],
  resource
) when {
  resource is Announcement &&
  resource has school_id &&
  principal has school_id &&
  resource.school_id == principal.school_id &&
  principal has capacity &&
  (principal.capacity == "principal" ||
   principal.capacity == "assistant_principal" ||
   principal.capacity == "teacher" ||
   principal.capacity == "admin")
};

permit(
  principal,
  action in [Action::"read", Action::"create", Action::"delete"],
  resource
) when {
  resource is UserBlock &&
  resource has blocker_id &&
  resource.blocker_id == principal.id
};

permit(
  principal,
  action == Action::"read",
  resource
) when {
  resource is DirectConversation &&
  // The handler applies the participant predicate in the database query.
  // Cedar still gates the procedure to authenticated, non-wanderer users.
  principal has capacity && principal.capacity != "wanderer"
};

permit(
  principal,
  action == Action::"create",
  resource
) when {
  resource is DirectConversation &&
  resource has user1_id &&
  resource.user1_id == principal.id
};

permit(
  principal,
  action == Action::"read",
  resource
) when {
  resource is DirectMessage &&
  principal has capacity &&
  principal.capacity != "wanderer"
};

permit(
  principal,
  action == Action::"create",
  resource
) when {
  resource is DirectMessage &&
  resource has author_id &&
  resource.author_id == principal.id
};
