# AUTH + PERMISSIONS

Prepare boundaries without inventing an authentication backend.

`features/auth` owns Login, Forgot Password, Select Tenant.

Do not scatter raw permission strings in JSX.
If a role should not know a capability exists, hide it.
If a known capability is restricted, show a clear permission state.

Customer Portal must never expose AI Operations, Audit Log, internal cost floor, internal negotiation strategy, other customers, or tenant administration.
