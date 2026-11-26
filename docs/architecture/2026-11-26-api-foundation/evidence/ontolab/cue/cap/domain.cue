package cap
capabilities: "enrollment.approve": {kind: "command", lifecycle_transition: "Enrollment.invited->active", timeout_ms: >=1000}
capabilities: "enrollment.list": {kind: "query"}
