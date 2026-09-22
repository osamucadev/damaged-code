# Design System

## Goals

This document defines the frontend design system for the Damaged Code web client.

It is a frontend concern. It is separate from the system design and backend boundaries described in `docs/ARCHITECTURE.md`.

The design system exists to make the product interface:

1. visually consistent across every screen;
2. composed from reusable components instead of repeated markup;
3. driven by semantic tokens instead of scattered literal values;
4. documented in isolation through Storybook;
5. accessible by default;
6. tolerant of English and Portuguese text lengths;
7. testable as behavior rather than as styling detail.

The system is deliberately small. It grows when the product needs it, not in advance.

## Visual inspiration and attribution

The primary artistic reference for this interface is:

```text
Rick and Morty fanart UI
Maksim Banshchikov
https://www.behance.net/gallery/101907237/Rick-and-Morty-fanart-UI
```

Artist profile:

```text
https://www.behance.net/mechanizzer
```

That work is used as art direction only.

The following rule is not negotiable:

1. Do not copy the reference layouts.
2. Do not copy or trace its illustrations, icons, textures, or other assets.
3. Do not reproduce its screens.
4. Do not present the reference work as part of this project.

Damaged Code implements its own layouts, its own components, its own tokens, its own interactions, and its own assets. The reference informs the mood and the visual language, nothing more.

Rick and Morty and related names remain the property of their respective rights holders. This project is an independent technical challenge.

## Visual language

The interface should read as a diegetic object from the show's universe while still working as a modern responsive web application.

The intended vocabulary:

```text
mechanical panels and industrial surfaces
retrofuturistic machinery
thick dark outlines
physical controls rather than flat rectangles
paper and dossier objects for documents
old monitor and CRT influence for data surfaces
metallic frames, screws, and hardware details
worn, aged surfaces
```

Color roles:

```text
acid green      primary interaction accent
cyan and blue   display and screen surfaces
beige and brown structural machine surfaces
red and orange  warning and destructive meaning
```

Usability is the constraint that outranks theme. If a decorative detail harms readability, focus visibility, or responsive behavior, the decoration loses.

## Atomic Design approach

Atomic Design is used pragmatically as a composition methodology.

```text
apps/web/src/design-system/
  tokens/        token definitions and the global token layer
  atoms/         smallest reusable interface pieces
  molecules/     small compositions of atoms with one clear purpose
  organisms/     product level compositions, added when the product needs them
```

Rules:

1. Next.js routes, layouts, and page level markup stay in `src/app`. They are not forced into the methodology.
2. A category directory is created when its first real component exists. Empty categories are not created to satisfy the pattern.
3. Components emerge from product needs, not from speculation.
4. A component earns promotion into the design system when it is used in more than one place, or when it carries visual rules that must stay consistent.
5. Product specific data fetching never lives inside a design system component.

## Implementation technique

Components are styled with CSS Modules and the token custom properties.

```text
Component.tsx          behavior and markup
Component.module.css   styling, built only from tokens
Component.stories.tsx  documented states
Component.test.tsx     behavior tests
```

CSS Modules were chosen because they ship with Next.js, need no extra runtime, keep class names scoped, and leave the token layer as plain CSS that Storybook, the application, and future tooling all read the same way. A utility class framework was not introduced, because this interface is built from a small number of heavily styled physical objects rather than from many one off layout combinations.

## Implemented state

The first components exist and are documented in Storybook:

```text
atoms/Button             machine key with primary, secondary, and danger variants
atoms/Panel              mechanical panel with optional title, header action, and hardware
atoms/DisplaySurface     CRT style surface for machine readouts
atoms/StatusIndicator    lamp plus required status text
atoms/Loader             busy indicator with an announced label
molecules/PropertyRow    one labelled property of an object
```

`src/design-system/index.ts` is the public entry point. Application code imports from there rather than from individual component files.

Color pairings were verified against the WCAG AA threshold of 4.5:1 for normal text. The danger tokens are split for that reason: `color.accent.danger` is the deeper red used as a surface behind light text, and `color.accent.danger.display` is the brighter red used as text on dark screen surfaces. Using a single red would have failed contrast on one of the two.

## Component boundaries

Design system components:

1. receive all user facing text through props or children;
2. do not call the API, and do not know the project BFF exists;
3. do not own product state or routing;
4. expose semantic HTML and accessible roles;
5. forward the native attributes a caller reasonably needs;
6. accept a `className` so callers can position them without rewriting their internals.

Product components in `src/app` and future feature directories own data, state, and localized strings. They compose design system components.

This separation is what keeps Storybook independent from API availability and from Firebase.

## Token philosophy

Tokens are CSS custom properties. They are defined once in the token layer and consumed everywhere else.

Two levels exist:

```text
primitive   raw palette and scale values, private to the token layer
semantic    meaning based names used by components
```

Components use semantic tokens only. A component that needs a value with no token is a signal that a token is missing, not a reason to inline a literal value.

Semantic color names follow the concept they represent:

```text
color.surface.machine    structural body of the interface
color.surface.panel      raised mechanical panel
color.surface.screen     CRT style data surface
color.surface.paper      dossier and document surface
color.border.heavy       thick outline that defines physical edges
color.accent.primary     acid green interaction accent
color.accent.display     cyan display accent
color.accent.warning     caution meaning
color.accent.danger      destructive meaning
```

The same approach applies to typography, spacing, radius, border width, shadow, motion, and layering.

Literal values are acceptable only for genuinely local geometry that carries no shared meaning, such as a single decorative offset inside one component.

## Motion philosophy

Motion is part of the system, not a per component improvisation.

```text
motion.fast     immediate feedback, such as a control reacting to a press
motion.normal   ordinary state transitions
motion.card     deliberate physical movement, such as a dossier opening
easing.mechanical  firm, machine like, no bounce
easing.pop         slight overshoot for objects that snap into place
```

Rules:

1. Motion communicates a change of state. It is not decoration.
2. Every animated component must remain fully usable when animation is removed.
3. `prefers-reduced-motion: reduce` is honored at the token layer, so components inherit the behavior instead of each one reimplementing it.

## Storybook

Storybook documents the reusable components in isolation.

```text
pnpm storybook         start the development Storybook
pnpm build-storybook   build the static Storybook
```

Both commands also exist inside the web application workspace.

Storybook builds and runs with no application server, no API, and no network access.

Integration:

```text
storybook 10 with @storybook/nextjs-vite
```

That integration was chosen because the workspace already runs Vite through Vitest, so Storybook reuses the existing pipeline instead of introducing a parallel build toolchain.

Storybook requirements:

1. It runs from this monorepo with PNPM.
2. It loads the project token layer, so components look the way they look in the application.
3. It never depends on the project API, on network access, or on Firebase.
4. It is covered by the same lint and type checking expectations as the application.

Stories should represent meaningful states rather than one perfect example. Depending on the component, that includes:

```text
default
selected
disabled
loading
error
long content, to prove the component survives Portuguese and English text lengths
reduced motion, where the component animates
```

## Accessibility expectations

1. Interactive elements are real interactive elements. A control that behaves like a button is a button.
2. Keyboard focus is always visible, and the focus indicator is a token, not a per component decision.
3. Color is never the only carrier of meaning. Status uses text or shape as well as color.
4. Decorative detail is hidden from assistive technology.
5. Contrast is checked against the surface the component actually sits on.
6. Components accept accessible names from the caller, because the caller owns the localized strings.
7. Animation respects `prefers-reduced-motion`.

## Character dossier interaction

This is an approved future interaction. It is documented here so the design system grows toward it. It is not implemented yet.

When a user selects a character from the future character grid, the character opens as a dossier or physical card, not as a generic modal.

Intended behavior:

```text
character selected
the card visually detaches from its original position in the grid
the card moves toward the foreground
a subtle 3D rotation gives it the feel of a physical card being turned
the backdrop darkens behind it
the dossier settles facing the user
closing reverses the motion naturally
```

The dossier may present the character data the upstream API provides through the project BFF:

```text
image
name
status
species
type when present
gender
origin
last known location
episode information
```

Accessibility requirements for that interaction:

```text
Escape closes the dossier
focus moves into the dossier when it opens and returns to the originating card when it closes
focus stays inside the dossier while it is open
an explicit, visible close control exists
backdrop behavior is predictable and documented
prefers-reduced-motion replaces the movement with a simple appearance change
all content and controls remain usable with no animation at all
```

The interaction uses `motion.card` and `easing.pop`. It must never be the only way to read character data.

## Internationalization

The interface supports English and Portuguese, pt-BR.

Consequences for components:

1. Components do not hardcode user facing strings. Text arrives from the caller, which reads it from localization resources.
2. Layouts tolerate text growth. Portuguese is frequently longer than English.
3. Fixed width controls that would clip a translated label are avoided.
4. Long content states belong in Storybook, so text growth problems are visible before they reach the product.

Full application localization is a later checkpoint. This checkpoint only guarantees that the component layer will not block it.

## How a component enters the design system

1. A product need appears in a real screen.
2. The implementation stays local until it is needed twice, or until it carries visual rules that must stay consistent.
3. It is then moved into the correct Atomic Design category.
4. It is rewritten to take text and data through props.
5. It replaces every literal value that a token already represents.
6. It gets stories for its meaningful states.
7. It gets tests for its behavior, not for its styling.
8. This document is updated when the system's rules change, not for each component added.
