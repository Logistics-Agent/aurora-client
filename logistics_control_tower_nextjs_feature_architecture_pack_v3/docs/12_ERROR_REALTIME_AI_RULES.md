# ERROR + REALTIME + AI

Normalize Axios/backend errors into `ApiError`.
Support validation, unauthenticated, forbidden, not found, conflict, server, network, timeout.
Never render raw Axios errors.

Partial failures should remain local where possible.

Realtime states: live, reconnecting, disconnected, stale, offline.
Never show Live when GPS is stale.

Important AI results should support result, confidence, reason, sources, timestamp, suggested action, and human review actions.
Never expose private chain-of-thought.
