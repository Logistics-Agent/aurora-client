# PRODUCT MODULE MAP → FEATURE MAP

Recommended top-level features:

```text
features/
├── auth/
├── command-center/
├── shipment/
├── route-tracking/
├── documents/
├── compliance/
├── commercial/
│   ├── cost/
│   ├── negotiation/
│   └── billing/
├── ai-assistant/
├── notifications/
├── email-agent/
├── administration/
└── customer-portal/
```

Shipment owns list/create/import/detail shell/cargo/timeline.

Shipment Detail contains large nested tabs:

```text
features/shipment/tabs/
├── overview/
├── cargo/
├── route-tracking/
├── documents/
├── compliance/
├── cost/
├── negotiation/
├── billing/
└── timeline/
```

Each large tab may itself contain `components/`, `hooks/`, `constants/`, `types/`, `utils/`, `dto/`, `schemas/` when actually necessary.

Global Compliance/Tracking workspaces remain top-level features. Shipment tabs are contextual compositions, not copies of entire global workspaces.
