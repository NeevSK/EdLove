package cap
#Capability: {
	id: =~"^[a-z]+\\.[a-z_]+$"
	kind: "query" | "command"
	transaction: bool | *false
	audit: bool | *false
	authenticated: true
	timeout_ms: int & <=5000 | *3000
	if kind == "command" {transaction: true, audit: true, idempotency_key: true}
	idempotency_key?: bool
	lifecycle_transition?: string
}
capabilities: [ID=string]: #Capability & {id: ID}
