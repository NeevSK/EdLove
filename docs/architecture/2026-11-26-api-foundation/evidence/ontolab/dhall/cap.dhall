let CapKind = < query | command >
let domain = { approve = { id = "enrollment.approve", kind = CapKind.command, transaction = True, audit = True } }
let deploy = { approve = { timeout_ms = 3000 } }
let extra = ./extra.dhall
let merged = domain /\ deploy /\ extra
let ok = merged.approve
let isCommand = merge { query = False, command = True } ok.kind
let rule = assert : (if isCommand then ok.transaction && ok.audit else True) === True
let timeoutRule = assert : Natural/isZero (Natural/subtract 5000 ok.timeout_ms) === True
in  merged
