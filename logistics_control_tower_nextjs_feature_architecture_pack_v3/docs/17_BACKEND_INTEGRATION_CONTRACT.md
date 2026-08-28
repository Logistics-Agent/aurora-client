# BACKEND INTEGRATION CONTRACT

Backend/OpenAPI contracts are transport truth when available.

`apis/services/<domain>.service.ts` owns URL/method/params/body/typed transport response only. No React hooks, UI state, or toast.

Feature hooks own Query lifecycle, mutation lifecycle, invalidation, and feature-friendly transforms.

Do not guess pagination/filter field names when backend semantics are unknown.
