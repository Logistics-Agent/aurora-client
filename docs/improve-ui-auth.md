# ROLE

You are a senior frontend engineer and UI implementation specialist working inside an existing production Next.js application.

Your task is to implement a new high-fidelity Login page UI for Aurora Client.

This is primarily a UI implementation task.

You are NOT being asked to rewrite authentication, redesign the application architecture, rebuild the Live Map, or refactor unrelated parts of the project.

Your priorities are:

1. Preserve existing authentication behavior.
2. Implement a premium cinematic Login UI.
3. Build a high-quality interactive Three.js Earth.
4. Keep changes tightly scoped.
5. Follow the existing Aurora Client architecture and repository conventions.
6. Visually verify and iterate in Chrome.

---

# PROJECT LOCATION

Project root:

D:\aurora\aurora-client

---

# MANDATORY FIRST STEP — READ AGENTS.md

Before doing ANY implementation work, you MUST read:

D:\aurora\aurora-client\AGENTS.md

AGENTS.md is the authoritative project instruction file.

Treat it as the source of truth for:

- project architecture
- folder structure
- coding conventions
- naming conventions
- component patterns
- styling conventions
- state management patterns
- API patterns
- testing requirements
- validation commands
- repository-specific constraints
- implementation workflow

Do NOT start coding before reading AGENTS.md.

If anything in this prompt conflicts with AGENTS.md, follow AGENTS.md unless this prompt explicitly overrides that specific requirement.

After reading AGENTS.md, inspect only the parts of the codebase necessary to implement the Login page correctly.

Do not perform broad repository exploration without a clear reason.

---

# PROJECT CONTEXT

Aurora Client is the frontend web application of an enterprise:

Logistics AI Control Tower.

Aurora is designed for logistics companies, transportation companies, freight forwarders, import/export businesses, and operational supply-chain teams.

The application provides a centralized platform for managing the logistics lifecycle.

Major capabilities include:

- Shipment management
- Shipment status management
- Real-time shipment tracking
- GPS tracking
- Live Map
- Exception detection and handling
- Route planning
- Route comparison
- Route approval
- Document management
- Document upload
- OCR processing
- OCR review
- Compliance
- Cost estimation
- Negotiation
- Billing
- Invoice
- Mail
- Notifications
- AI Assistant
- Customer Portal

The Customer Portal allows customers to:

- View their shipments
- Track shipment journeys
- View shipment documents
- Review quotes
- Confirm quotes
- View invoices
- Receive notifications
- Use a customer-facing AI Assistant

Main application areas include:

Authentication:

- Login
- Forgot Password
- Tenant Selection

Operations:

- Overview
- Shipments
- Live Map
- Route Planning

Documents & Compliance:

- Document Center
- Upload
- OCR Review
- Compliance

Commercial:

- Billing
- Invoice
- Cost Estimate
- Negotiation

AI & Communication:

- AI Assistant
- Mail
- Notifications

Customer Portal:

- Shipments
- Tracking
- Documents
- Quotes
- Invoices
- Assistant

Current frontend stack includes:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- Axios
- Zod
- MapLibre
- Three.js

Most major screens and workflows already exist.

Some current features still use mock/fixture data while backend integration with aurora-server is ongoing.

The current Login page and authentication flow already exist.

---

# PRIMARY GOAL

Implement a completely refreshed Login page UI for Aurora Client.

The Login page should become the cinematic entrance into the Aurora Logistics AI Control Tower.

The main visual centerpiece must be a large, realistic, interactive 3D Earth.

The page should communicate:

- global logistics
- real-time freight movement
- worldwide connectivity
- global operations
- transportation intelligence
- enterprise logistics control
- real-time visibility

The first impression should feel like:

“Entering a global logistics command system.”

NOT:

“A standard SaaS login page with a globe decoration.”

The Earth must feel like part of the Aurora product experience, not simply a decorative background.

---

# CRITICAL TASK DEFINITION

This task is:

LOGIN UI IMPLEMENTATION ONLY.

The current authentication logic already exists.

Keep the current auth behavior.

Change the visual presentation.

Conceptually:

OLD:

Existing Login UI +
Existing Auth Logic

NEW:

New Login UI +
THE SAME Existing Auth Logic

The goal is:

Change presentation.

Do not change behavior.

---

# AUTH LOGIC — MUST PRESERVE EXISTING IMPLEMENTATION

The existing authentication logic MUST be preserved.

Do NOT:

- rebuild authentication
- rewrite authentication
- replace authentication
- simplify authentication architecture
- refactor authentication unnecessarily
- mock authentication
- create fake login behavior
- invent a new auth API
- modify backend authentication
- change backend contracts
- change token handling
- change session handling
- change cookie behavior
- change auth state architecture
- change redirect behavior
- change tenant flow
- replace working auth hooks
- replace working auth mutations
- replace auth stores
- replace validation logic merely for convenience

Before implementing the new UI, inspect and understand the existing authentication implementation.

Preserve all current behavior including, where applicable:

- Login API calls
- Login request payload
- Login response handling
- Axios integration
- TanStack Query mutations
- authentication hooks
- Zustand authentication state
- access token handling
- refresh token handling
- cookies
- localStorage
- sessionStorage
- session handling
- Zod validation
- form validation
- form submission
- authentication errors
- loading states
- disabled states
- successful login redirects
- protected route behavior
- tenant selection
- authorization behavior
- Remember Me behavior
- Forgot Password navigation
- already-authenticated-user behavior
- aurora-server contracts

If the current implementation already uses code conceptually similar to:

form.handleSubmit(...)
loginMutation.mutate(...)
loginMutation.mutateAsync(...)
useLogin(...)
useAuth(...)
authStore(...)
router.push(...)
router.replace(...)
validationSchema(...)

reuse the existing flow.

Do NOT create equivalent replacement logic.

If the current Login component mixes business logic and UI, make only the smallest safe changes necessary to replace the presentation.

Avoid broad refactoring.

---

# FUNCTIONAL PRESERVATION RULE

The new Login page must behave exactly like the current Login page from an authentication perspective.

The UI may change significantly.

The functional outcome must not.

For example:

Valid credentials before redesign
→ successful login

Valid credentials after redesign
→ same successful login behavior

Invalid credentials before redesign
→ current error behavior

Invalid credentials after redesign
→ same functional error behavior

Tenant selection before redesign
→ current tenant flow

Tenant selection after redesign
→ same tenant flow

Any authentication regression means the task is NOT complete.

---

# SCOPE

You may implement or modify code directly related to the Login presentation.

Allowed scope includes:

- Login page
- Login layout
- Login form presentation
- Login-specific UI components
- Login-specific styling
- Login responsive behavior
- Login animation
- Three.js Login globe
- Earth rendering
- atmosphere
- route visualization
- logistics markers
- route particles
- Login-specific ambient UI
- Login loading presentation
- Login error presentation
- input styling
- button styling
- focus states
- hover states
- accessibility improvements directly related to the Login UI

Do not expand the task beyond this scope unless strictly necessary.

---

# OUT OF SCOPE

Do NOT redesign or rebuild:

- Overview
- Shipments
- Live Map
- Route Planning
- Documents
- OCR
- Compliance
- Billing
- Invoice
- Cost Estimate
- Negotiation
- AI Assistant
- Mail
- Notifications
- Customer Portal
- global app shell
- application sidebar
- application header
- unrelated shared components
- backend APIs

Do NOT turn this into a general Aurora redesign.

---

# VISUAL REFERENCE

Use the supplied Earth visual reference as the PRIMARY visual reference for the Login page.

Study the reference carefully for:

- composition
- Earth scale
- Earth crop
- Earth positioning
- visual balance
- darkness
- lighting
- atmospheric depth
- typography hierarchy
- spacing
- negative space
- cinematic presentation
- subtle UI treatment
- premium feeling
- motion quality

Do NOT blindly clone the original reference.

Do NOT copy:

- reference branding
- original text
- navigation
- original timeline
- historical Earth controls
- unrelated informational content
- unrelated business concept

Translate its visual language into:

Aurora — Logistics AI Control Tower.

---

# DESIGN DIRECTION

The new Login page should feel:

- premium
- cinematic
- enterprise
- global
- sophisticated
- refined
- restrained
- trustworthy
- operational
- logistics-focused
- technologically advanced

Avoid making it feel like:

- crypto
- cyberpunk
- gaming UI
- sci-fi control panel
- generic AI startup
- generic SaaS template
- glowing neon dashboard

Avoid:

- excessive cyan
- excessive neon
- giant gradients
- excessive glassmorphism
- glowing borders everywhere
- random particles
- unnecessary cards
- excessive panels
- excessive labels
- decorative noise

The design hierarchy should primarily come from:

1. Earth
2. Typography
3. Composition
4. Negative space
5. Motion
6. Subtle logistics details

---

# TARGET VIEWPORT

Design desktop-first.

Primary viewport:

1440 × 900

Also verify:

1920 × 1080

1366 × 768

The 1440 × 900 version should receive the strongest visual attention.

---

# DESKTOP COMPOSITION

Use an asymmetrical cinematic composition.

Suggested distribution:

LEFT:
approximately 32–38%

Use for:

- Aurora branding
- product context
- Login heading
- Login form

CENTER / RIGHT:
approximately 62–68%

Use for:

- large interactive Earth
- logistics routes
- logistics hubs
- route movement
- atmospheric visual

Do NOT create a strict:

50% login panel / 50% image

SaaS layout.

Do NOT put the Earth inside a rectangular card.

Do NOT make the Earth look like a background illustration.

The Earth should exist naturally inside the page environment.

It may extend toward the center and visually overlap the composition as long as form readability remains excellent.

The Earth should feel large.

The Earth should feel immersive.

The Earth should immediately attract attention.

---

# LOGIN CONTENT

Use the project's existing branding and existing functional auth fields.

Possible visual copy:

Eyebrow:

LOGISTICS AI CONTROL TOWER

Heading:

Welcome back

Supporting text:

Sign in to access your global logistics operations.

Use the existing field requirements.

Likely:

- Email
- Password

Keep existing functionality where available for:

- Remember Me
- Forgot Password
- validation
- errors
- loading
- submit
- redirect
- tenant behavior

Do NOT invent auth functionality the application does not currently support.

Do NOT add fake Google authentication.

Do NOT add fake Microsoft authentication.

Do NOT add fake SSO.

Only expose authentication capabilities that actually exist in the current project.

---

# LOGIN FORM VISUAL STYLE

Avoid a giant opaque card.

The form should feel integrated with the environment.

Prefer:

- minimal form container
- refined spacing
- strong typography
- subtle borders
- restrained background treatment
- extremely subtle glass effect if necessary
- enterprise-grade field styling

Inputs should have polished:

- default
- hover
- focus
- filled
- disabled
- error

states.

The Sign In button should have polished:

- default
- hover
- active
- loading
- disabled

states.

Errors should remain easy to understand.

Do not hide validation for visual cleanliness.

Do not sacrifice usability for aesthetics.

---

# THREE.JS EARTH

The Earth is the most important visual element.

It MUST use Three.js.

Do NOT use a static Earth image as the final implementation.

Do NOT use:

- PNG Earth
- JPG Earth
- GIF
- video loop
- CSS-only globe
- fake 3D sphere
- pre-rendered animation

The globe should look realistic and premium.

Where appropriate, include:

- realistic Earth surface texture
- subtle atmospheric glow
- realistic directional lighting
- night-side shading
- optional subtle clouds
- subtle specular/depth response
- appropriate tone mapping if already supported

Avoid exaggerated blue atmosphere.

Avoid a holographic appearance.

The desired visual is:

premium interactive digital Earth

not:

sci-fi neon planet

---

# DEFAULT EARTH ORIENTATION

The initial Earth orientation should support Aurora's logistics context.

Prefer showing a composition involving:

- Vietnam
- Southeast Asia
- Singapore
- China
- India
- Middle East
- part of Europe

depending on what gives the strongest composition.

Vietnam / Southeast Asia should feel visually relevant.

Do not randomly orient the globe toward an unrelated region.

---

# EARTH SCALE

The globe must be visually large.

Do not make it a small 3D object floating beside the form.

At 1440 × 900, the Earth should occupy a substantial portion of the screen.

It may extend beyond the viewport boundaries.

A cinematic crop is acceptable and encouraged when visually appropriate.

Match the visual impact of the supplied reference rather than trying to show the entire Earth at all times.

---

# EARTH INTERACTION

Interaction quality is important.

Support:

- mouse drag
- smooth globe rotation
- damping
- subtle inertia
- slow automatic rotation

When manual interaction ends:

gradually return to subtle automatic motion.

Avoid raw default OrbitControls behavior if it feels generic or uncontrolled.

Tune interaction deliberately.

Avoid:

- aggressive zoom
- large camera zoom ranges
- extreme rotation behavior
- broken composition
- jerky drag
- abrupt stopping
- excessive inertia

The Earth should feel responsive but controlled.

This is a presentation-quality interaction.

---

# LOGISTICS NETWORK

The Earth should visually communicate active global freight movement.

Use a restrained number of logistics hubs.

Potential locations:

- Ho Chi Minh City
- Cat Lai Port
- Singapore
- Shanghai
- Hong Kong
- Tokyo
- Dubai
- Rotterdam
- Los Angeles

Possible example routes:

Ho Chi Minh City → Singapore

Singapore → Shanghai

Shanghai → Rotterdam

Shanghai → Tokyo

Ho Chi Minh City → Los Angeles

Do not render every possible route.

The goal is a living network, not visual noise.

---

# TRANSPORT ROUTE LANGUAGE

AIR:

Use elevated curved arcs above the Earth surface.

SEA:

Use routes closer to the globe surface.

ROAD:

Only represent road movement if it is visually meaningful at the globe scale.

Do not create unrealistic random connections solely for decoration.

Keep route styling refined and subtle.

---

# LOGISTICS HUB MARKERS

Markers may represent:

- Ports
- Airports
- Logistics Hubs

Use minimal markers.

Prefer:

small point +
subtle ring +
optional subtle pulse

Do NOT use large map-pin icons.

Do NOT cover the globe in labels.

For important interactive markers, a small tooltip is acceptable.

Example:

CAT LAI PORT
Vietnam · SEA

or:

SIN
Singapore Hub
AIR · SEA

Tooltips must remain secondary.

---

# ROUTE ANIMATION

Selected routes should contain subtle movement.

Possible movement representations:

- cargo pulse
- shipment particle
- aircraft indicator
- vessel indicator
- light trail

Animations should:

- follow route geometry correctly
- move continuously
- interpolate smoothly
- remain visually small
- use restrained glow
- avoid excessive brightness

Do not flood all routes with particles.

The globe should feel alive without becoming distracting.

---

# CINEMATIC ENTRANCE

Build a short premium entrance animation.

Suggested sequence:

0.0s

Near-dark environment.

0.2–1.0s

Earth gradually fades into view.

Perform a very subtle camera push-in.

0.6–1.3s

Atmosphere and lighting settle.

0.8–1.5s

Important hubs become visible.

1.0–1.7s

Selected routes progressively appear.

1.3s+

Route movement begins.

1.1–1.8s

Login UI fades in and moves upward approximately 8–12px.

Total initial entrance:

approximately 1.5–2.2 seconds.

Do NOT make a long splash-screen animation.

After entrance completion:

motion should settle into a calm continuous state.

Respect:

prefers-reduced-motion

---

# BACKGROUND

Do not use a completely flat pure-black background.

Create subtle visual depth.

Possible techniques:

- near-black base
- extremely dark navy undertones
- subtle radial lighting behind Earth
- subtle vignette
- extremely light grain/noise
- atmospheric haze

Optional subtle stars may be used if they improve the result.

If used, stars must remain extremely understated.

Do not create an outer-space game aesthetic.

---

# SUBTLE CONTROL-TOWER DETAILS

You may add a very small amount of supporting ambient system UI.

Examples:

AURORA NETWORK
CONNECTED

GLOBAL NETWORK
ONLINE

LIVE NETWORK
24 ACTIVE ROUTES

Potential tiny secondary information:

- UTC
- coordinates
- connection indicator
- route count
- active transport indicator

These should reinforce the logistics system feeling.

They must remain subtle.

Do NOT add:

- dashboard KPI cards
- charts
- statistics panels
- tables
- activity feeds
- risk cards
- operational filters
- sidebar
- large zoom controls
- dashboard widgets

This is a Login page.

---

# EXISTING LIVE MAP

Aurora already contains Live Map functionality.

Aurora also already uses:

- MapLibre
- Three.js
- logistics fixtures/data
- geographic coordinates
- route-related functionality

You MAY inspect the current Live Map implementation when useful for technical reuse.

Potential technical reuse areas:

- Earth assets
- Earth textures
- route data
- lat/lng utilities
- coordinate conversion
- interpolation
- route geometry
- marker logic
- Three.js helpers
- shared animation utilities
- loading logic
- logistics fixture data

However:

Do NOT redesign Live Map.

Do NOT rewrite Live Map.

Do NOT refactor Live Map unless it is strictly necessary for the Login implementation.

Do NOT change existing Live Map behavior.

Do NOT change Live Map UI.

Do NOT use Live Map as the primary visual reference.

The supplied Earth reference is the visual reference for Login.

Existing Live Map code is only a possible technical reference.

---

# EXISTING PROJECT DESIGN SYSTEM

Inspect the existing design system before inventing new patterns.

Check relevant:

- Tailwind configuration
- global CSS
- typography
- theme tokens
- shadcn/ui usage
- Button components
- Input components
- Checkbox components
- form patterns
- error presentation
- loading presentation

Reuse existing project conventions where they fit.

Do not force an existing component into the design if it materially prevents achieving the desired visual quality.

But avoid duplicating already-solved behavior.

---

# PROJECT ARCHITECTURE

Follow AGENTS.md.

Respect the existing Aurora project structure.

Do not invent an arbitrary architecture if the repository already defines conventions.

Inspect existing patterns for:

- features
- components
- hooks
- constants
- types
- utils
- stores
- APIs
- queries
- mutations

before creating new files.

Keep authentication/business logic separate from Three.js rendering.

Conceptually, responsibility may look like:

LoginPage
├── LoginForm
├── LoginGlobe
└── LoginAmbientUI

If the globe becomes complex, it may internally contain responsibilities such as:

LoginGlobe
├── Earth
├── Atmosphere
├── Routes
├── RouteParticles
├── Markers
├── CameraController
└── InteractionController

This structure is only conceptual.

Do NOT blindly create these exact files.

Follow AGENTS.md and the existing project conventions.

Do not over-engineer.

---

# DEPENDENCY RULES

Use the existing Aurora Client stack.

Before adding anything:

inspect package.json.

Do NOT install packages unnecessarily.

Three.js already exists in the project context.

Prefer existing dependencies.

Do NOT:

- create a separate frontend
- create a standalone HTML app
- create another Next.js project
- introduce a new UI framework
- replace Tailwind
- replace shadcn/ui
- replace TanStack Query
- replace Zustand
- replace Axios
- replace Zod
- introduce another globe framework just for convenience
- add dependencies merely because you personally prefer them

Use the project's current dependency setup.

---

# PERFORMANCE

This Login page will be used during live presentations.

It must be:

visually impressive
AND
stable.

Target smooth frame rate.

Pay attention to:

- requestAnimationFrame lifecycle
- Three.js render loop
- React rerenders
- texture resolution
- geometry complexity
- route count
- particle count
- object allocation
- window resizing
- component mount/unmount
- event listener cleanup
- texture disposal
- material disposal
- geometry disposal
- WebGL cleanup
- tab visibility
- devicePixelRatio

Do NOT drive frame-by-frame Three.js animation through React state.

Use the Three.js animation loop directly.

Avoid allocating unnecessary vectors/objects inside every frame.

Clamp pixel ratio where appropriate.

For example:

Math.min(window.devicePixelRatio, 2)

If needed, reduce visual complexity on weaker devices by reducing:

- route count
- particle count
- cloud complexity
- visual effects

without destroying the overall visual identity.

---

# RESPONSIVE BEHAVIOR

Desktop is the highest priority.

Desktop:

- full cinematic layout
- large Earth
- Login remains easy to use

Tablet:

- reduce Earth scale
- maintain visual balance
- preserve form readability

Mobile:

- prioritize Login usability
- move or crop Earth appropriately
- allow Earth to sit behind/above the form
- reduce route complexity
- reduce particles
- avoid WebGL blocking form input
- preserve Aurora identity

Do not create a completely unrelated mobile design.

Do not hide the Earth immediately unless required for performance or usability.

---

# ACCESSIBILITY

Do not sacrifice accessibility for visual polish.

Preserve:

- semantic form structure
- input labels
- keyboard navigation
- visible focus states
- button semantics
- error accessibility
- form submission behavior
- appropriate autocomplete attributes if already used

The Three.js canvas must not block interaction with the Login form.

Respect:

prefers-reduced-motion

---

# NO EARLIER DEMO COPYING

Earlier demos may already exist in this repository.

Do NOT copy them.

Do NOT clone their implementation just because they are nearby.

Do NOT use unrelated pages as the visual design reference.

Existing code may only be reused where technically appropriate.

The Login design must be implemented specifically for this task and supplied reference.

---

# IMPLEMENTATION PROCESS

Follow this sequence.

## STEP 1 — READ PROJECT INSTRUCTIONS

Read:

D:\aurora\aurora-client\AGENTS.md

Do not code before completing this step.

---

## STEP 2 — INSPECT CURRENT LOGIN

Locate the current Login page.

Understand:

- route
- page component
- form component
- auth hooks
- mutations
- schemas
- store
- API calls
- form submission
- error handling
- loading behavior
- redirects
- Forgot Password
- Remember Me
- tenant behavior
- already-authenticated behavior

---

## STEP 3 — CLASSIFY EXISTING LOGIN CODE

Before changing code, clearly identify:

A. Authentication/business logic

B. Form/validation logic

C. Presentation/UI logic

The goal is primarily to replace or improve:

C. Presentation/UI logic

while preserving:

A. Authentication/business logic

and, as much as possible:

B. Form/validation logic

---

## STEP 4 — INSPECT DESIGN TOKENS

Inspect only what is necessary:

- Tailwind setup
- global styles
- typography
- colors
- shared form components
- shadcn components
- theme conventions

---

## STEP 5 — INSPECT EXISTING MAP CODE IF USEFUL

Inspect the Live Map / Three.js implementation only when useful for technical reuse.

Look for:

- Earth rendering
- textures
- geographical helpers
- route calculation
- markers
- route animation
- assets
- fixtures

Do not copy Live Map UI.

---

## STEP 6 — STUDY THE SUPPLIED REFERENCE

Analyze:

- globe size
- globe crop
- globe orientation
- composition
- spacing
- negative space
- hierarchy
- typography
- lighting
- visual density
- atmosphere

---

## STEP 7 — PLAN MINIMUM SAFE CHANGES

Before implementation, determine the smallest set of files that needs modification.

Do not make unrelated cleanup changes.

Do not refactor surrounding architecture without a clear requirement.

---

## STEP 8 — IMPLEMENT LOGIN UI

Implement:

- new Login composition
- new visual styling
- Three.js Earth
- routes
- markers
- animation
- responsive behavior

Wire the UI into the EXISTING authentication behavior.

Do not create replacement auth behavior.

---

## STEP 9 — RUN PROJECT VALIDATION

Follow AGENTS.md.

Run the appropriate existing project commands.

Where applicable:

- TypeScript check
- lint
- relevant tests
- build

Do not ignore failures.

Do not claim success if commands fail.

---

## STEP 10 — OPEN LOGIN IN CHROME

Open the actual running Login page in Chrome.

Do not rely only on code inspection.

---

## STEP 11 — VISUAL ITERATION

Primary viewport:

1440 × 900

Compare the rendered page against the supplied reference.

Check:

- Earth size
- Earth crop
- Earth orientation
- Earth placement
- Earth lighting
- atmosphere
- Login placement
- Login width
- heading size
- copy
- input height
- button height
- spacing
- route visibility
- marker visibility
- background
- negative space
- visual balance
- animation timing

Do not stop after the first implementation.

If it looks generic, improve it.

If the globe looks too small, improve it.

If the globe looks decorative instead of central, improve it.

If the page looks too busy, simplify it.

If the reference looks more cinematic, improve composition.

---

## STEP 12 — RESPONSIVE VERIFICATION

Verify at:

1440 × 900

1920 × 1080

1366 × 768

Also inspect:

tablet

mobile

Do not assume responsive behavior from CSS alone.

Actually inspect it.

---

# AUTHENTICATION REGRESSION TESTING

Verify existing authentication behavior after the UI implementation.

Test, where currently supported:

1. Empty form submission
2. Invalid email format
3. Missing password
4. Valid form submission
5. Invalid credentials
6. Backend/server error
7. Loading state
8. Disabled state
9. Successful authentication
10. Successful redirect
11. Tenant-selection redirect
12. Remember Me
13. Forgot Password navigation
14. Already-authenticated user behavior
15. Enter-key submission
16. Keyboard navigation
17. Double-submit prevention if currently implemented

The result must function the same way as before the UI redesign.

---

# THREE.JS INTERACTION TESTING

Verify:

1. Initial Earth load
2. Entrance animation
3. Auto rotation
4. Mouse drag
5. Rotation damping
6. Release inertia
7. Auto-rotation recovery
8. Route rendering
9. Route particle movement
10. Marker rendering
11. Window resize
12. High-DPI rendering
13. Tab leave / return
14. component unmount
15. cleanup
16. prefers-reduced-motion

Check Chrome DevTools console.

There should be no avoidable errors or warnings.

---

# RULES — MUST

You MUST:

- read AGENTS.md before coding
- understand current Login auth behavior before modifying UI
- preserve existing authentication logic
- preserve current API integration
- preserve current validation behavior
- preserve current routing behavior
- preserve current tenant flow
- preserve current error behavior
- preserve current state management
- implement only the Login presentation
- use Three.js for the Earth
- use existing project conventions
- keep changes tightly scoped
- visually verify in Chrome
- iterate after the first render
- verify auth regression behavior
- verify responsive behavior
- keep the implementation production-quality

---

# RULES — MUST NOT

You MUST NOT:

- rewrite authentication
- rebuild authentication
- replace authentication
- create fake authentication
- mock a new login flow
- change auth API contracts
- change token strategy
- change cookie strategy
- change current auth state architecture
- change redirect behavior
- change tenant flow
- touch aurora-server authentication
- redesign Live Map
- rebuild Live Map
- redesign unrelated pages
- redesign the Aurora application
- change the app shell unnecessarily
- copy earlier demos
- use unrelated pages as visual references
- create a standalone web application
- introduce unnecessary dependencies
- use a static Earth as the final globe
- turn Login into a dashboard
- add KPI cards
- add large data panels
- make the UI cyberpunk
- overuse cyan neon
- overuse glassmorphism
- sacrifice usability for effects
- stop after the first implementation
- claim validation passed without running it

---

# SUCCESS CRITERIA

The task is successful when:

1. Aurora has a finished new Login UI.

2. The Login page visually feels like the entrance into a Logistics AI Control Tower.

3. A large Three.js Earth is the hero visual.

4. The Earth feels realistic and premium.

5. The globe supports smooth interaction.

6. Global logistics routes visually communicate active freight movement.

7. Motion is restrained but impressive.

8. The Login form remains easy to use.

9. Existing authentication behavior remains functionally unchanged.

10. Existing auth API/state/validation/redirect logic is reused rather than replaced.

11. No unrelated pages are redesigned.

12. Live Map behavior remains unchanged.

13. The page works responsively.

14. Appropriate project validation passes.

15. The result has been visually inspected and refined in Chrome.

16. There are no avoidable browser-console errors.

17. The result is polished enough for a live product presentation.

---

# EXPECTED OUTPUT

The implementation should deliver:

- Completed Aurora Login page UI
- Existing authentication behavior preserved
- Interactive Three.js Earth
- Logistics routes
- Logistics hub markers
- Subtle route motion
- Cinematic entrance
- Responsive layout
- Accessible form interaction
- Good runtime performance
- Minimal changes outside Login-related files
- Successful validation according to AGENTS.md
- Chrome visual verification

---

# FINAL RESPONSE FORMAT

When implementation is finished, respond with a concise implementation report.

Use this structure:

## Changed

List every file you actually created or modified.

Do not list untouched files.

## UI

Briefly describe:

- Login composition
- Earth placement
- visual direction
- responsive behavior
- major interaction states

## Auth

Explain specifically how the existing authentication implementation was preserved.

Mention the actual existing:

- hook
- mutation
- form logic
- schema
- store
- routing behavior

that you reused.

Do not simply write:

“Auth preserved.”

Be specific.

## Three.js

Briefly explain:

- Earth implementation
- route implementation
- markers
- animation
- interaction
- performance handling
- cleanup

## Validation

List only commands/checks you ACTUALLY ran.

For example:

- TypeScript
- lint
- tests
- build

Report their real results.

Do not claim a check passed unless you actually ran it.

## Browser Verification

Report the viewport sizes you actually inspected.

For example:

- 1440 × 900
- 1920 × 1080
- 1366 × 768
- mobile size if inspected

Also mention:

- globe interaction checked
- Login form interaction checked
- console checked

Do not claim Chrome verification if you did not actually open and inspect the page.

## Remaining Issues

If anything remains incomplete, imperfect, blocked, or intentionally unchanged, state it explicitly.

Do not hide limitations.

---

# FINAL REMINDER

THIS IS A LOGIN UI IMPLEMENTATION TASK.

NOT AN AUTHENTICATION REWRITE.

NOT A LIVE MAP REDESIGN.

NOT AN APPLICATION REDESIGN.

Read:

D:\aurora\aurora-client\AGENTS.md

first.

Understand the current Login implementation.

Preserve the existing authentication logic.

Implement the new presentation around that logic.

Change the presentation, not the behavior.

The final Login page should feel like the entrance into:

Aurora — Logistics AI Control Tower.
