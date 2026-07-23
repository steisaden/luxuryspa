# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are resort decision-makers evaluating a premium wellness or spa concept. Their specific procurement role, property type, and buying stage remain open decisions.

## Product Purpose

“The Exhale” is a commercial concept experience that lets resort decision-makers evaluate a luxury spa treatment world through a continuous macro film, concise treatment narrative, and direct inquiry path. Success means the visitor understands the concept, experiences its material character, and requests a private walkthrough.

## Positioning

The product demonstrates the spa concept through one physically continuous journey—from warmed towel to botanical oil, steam, mineral water, and a calm treatment room—rather than relying on generic luxury claims or disconnected amenity imagery.

## Operating Context

Visitors evaluate the experience on desktop and mobile browsers, often with limited time and potentially restricted motion preferences. The primary landing route presents the commercial experience. A separate prompt archive documents the creative source, reconstruction logic, and technical architecture.

## Capabilities and Constraints

- Server-rendered Fastify and Nunjucks pages with meaningful no-JavaScript fallbacks.
- HTMX progressively enhances navigation, contextual chapter details, and inquiry submission.
- Native video rendering with scroll-controlled seeking only when JavaScript is available.
- A 20-second guided tour with a 10-second 2× mode.
- Inquiry submissions are validated server-side and return an on-page confirmation for this prototype.
- External inquiry delivery, CRM integration, property-specific pricing, and availability are undecided and must not be invented.

## Brand Commitments

- Working experience name: “The Exhale.”
- Voice: measured, sensory, precise, and commercially credible; never mystical, breathless, or hyperbolic.
- Binding source asset: `/Volumes/toshiba/downloads/website_videos/luxury_spa_video_website.mp4`.
- The interface must derive from the film’s towel fibers, condensation, botanical oil, skin, steam, eucalyptus, sandstone, candlelight, and mineral water.

## Evidence on Hand

- A 1280×720 H.264 film at 24 fps with AAC audio, actual duration 10.005 seconds, and file size 2,783,707 bytes.
- The supplied creative and technical brief.
- No testimonials, client logos, performance claims, pricing, certifications, or booking availability were supplied; none may be fabricated.

## Product Principles

1. Demonstrate the physical treatment world before describing it.
2. Preserve one-take continuity across film, scroll, and interaction language.
3. Keep commercial action clear without breaking the atmosphere.
4. Let server-rendered content remain complete when enhancement is unavailable.
5. Prefer verified material truth over generic luxury conventions.

## Accessibility & Inclusion

Core content, navigation, chapter copy, and inquiry actions must work without JavaScript. Keyboard navigation, visible focus, screen-reader status, responsive reflow, adequate contrast, and `prefers-reduced-motion` behavior are required.
