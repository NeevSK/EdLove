schema Capability:
    id: str
    kind: "query" | "command"
    transaction: bool = False
    audit: bool = False
    authenticated: bool = True
    timeout_ms: int = 3000
    check:
        authenticated, "every capability is authenticated"
        timeout_ms <= 5000, "security: timeout at most 5000"
        kind != "command" or (transaction and audit), "commands need transaction and audit"
