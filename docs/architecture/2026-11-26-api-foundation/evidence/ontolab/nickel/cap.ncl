let Capability = {
  id | String,
  kind | [| 'query, 'command |],
  transaction | Bool | default = false,
  audit | Bool | default = false,
  authenticated | Bool | force = true,
  timeout_ms | Number | std.contract.from_predicate (fun t => t <= 5000) | default = 3000,
} in
let CommandRule = std.contract.from_predicate (fun c => c.kind != 'command || (c.transaction && c.audit)) in
let security = { approve | Capability | CommandRule } in
let domain = { approve = { id = "enrollment.approve", kind = 'command, transaction = true, audit = true } } in
let deploy = { approve.timeout_ms = 3000 } in
let extra = import "extra.ncl" in
security & domain & deploy & extra
