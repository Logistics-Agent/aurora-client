# Phase 09 — AI Assistant, Notifications and Email Review

## Figma scope

Inspect [11 — Assistant](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-12) and [12 — Email & Notification](https://www.figma.com/design/drI45J1ajP37h7UD8mM1fx/Untitled?node-id=56-13): S26–S29 and Notification Preferences.

## Prompt for the coding AI

Implement `features/ai-assistant`, `features/notifications`, and `features/email-agent` with fixture-driven local interaction. Build S26 Default/Thinking/Answer/Timeout: answer cards explicitly include result, confidence, reasons, sources, timestamp, shipment context and visible actions. The local prompt interaction may switch between prepared fixture answers; it must not call an LLM or apply actions.

Build S27 notification drawer/full-page/empty/preferences, S28 email inbox states and S29 split Email Review. Group notifications by time and keep critical async events persistent. Email AI extraction displays classification, match confidence, extracted fields and a suggested action. Approve/Edit/Reject are local review states; approval applies one visible local UI change only after confirmation.

Implement staff shipment links throughout. Test AI timeout, notification read/filter, email review confirmation and lint/typecheck, then stop.
