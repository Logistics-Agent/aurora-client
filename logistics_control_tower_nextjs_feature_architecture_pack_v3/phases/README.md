# PHASE EXECUTION

Run one phase per agent run when possible:
00 Init → 01 Shared Core → 02 Layout/Routing → 03 Auth → 04 North Star → 05 Shipment → 06 Route/Tracking → 07 Docs/Compliance → 08 Commercial → 09 AI/Communication → 10 Admin → 11 Customer → 12 States → 13 3D → 14 QA.

For a very large phase such as Shipment, split internally by sub-feature but keep the same phase docs loaded.
