let CapKind = < query | command >
let domain = { approve = { id = "enrollment.approve", kind = CapKind.command, transaction = True, audit = True, timeout_ms = 8000 } }
let ok = domain.approve
let timeoutRule = assert : Natural/isZero (Natural/subtract 5000 ok.timeout_ms) === True
in domain
