# FRONTEND ARCHITECTURE

Use feature-first architecture + shared infrastructure.

Dependency direction:

```text
app → features → feature hooks → apis/services → lib/http → backend
```

`app/` owns routes/layouts/metadata/boundaries only.
`features/` owns product UI and feature behavior.
`apis/services/` owns HTTP endpoint calls.
`lib/` owns infrastructure.

Do not create a frontend repository layer, CQRS layer, DI container, or microfrontend architecture without a real future requirement.
