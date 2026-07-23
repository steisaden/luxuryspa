---
version: alpha
name: The Exhale
description: A mineral-water commercial experience shaped by a continuous macro spa film.
colors:
  deep-water: "#173F42"
  mineral-water: "#668B89"
  steam-ivory: "#F0ECE3"
  towel-white: "#FAF8F2"
  sandstone: "#B8A58C"
  eucalyptus: "#536347"
  oil-amber: "#B97832"
  skin-clay: "#8C5F49"
  ink: "#17211F"
  quiet-ink: "#44514D"
typography:
  display:
    fontFamily: Bellefair
    fontSize: 5rem
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  heading:
    fontFamily: Bellefair
    fontSize: 3rem
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  body:
    fontFamily: Albert Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: Albert Sans
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  hairline: 2px
  control: 999px
spacing:
  hairline: 1px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  xxl: 128px
components:
  button-primary:
    backgroundColor: "{colors.steam-ivory}"
    textColor: "{colors.deep-water}"
    rounded: "{rounded.control}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.towel-white}"
    textColor: "{colors.deep-water}"
    rounded: "{rounded.control}"
    padding: 16px
  button-dark:
    backgroundColor: "{colors.deep-water}"
    textColor: "{colors.towel-white}"
    rounded: "{rounded.control}"
    padding: 16px
---

## Overview

“The Exhale” lives in the physical interval between pressure and release. Its visual system is not a generic beige spa treatment: it follows the film’s actual descent from porous towel and skin into refractive water, then returns to candlelit stillness.

The persistent rule is **descent and return**. Dense macro texture gives way to translucent depth; tight framing opens into architectural calm. Every page should remain coherent when the film is paused because typography, color fields, spacing, and interaction all carry the same material logic.

## Colors

- **Deep Water:** the primary structural field and high-contrast anchor, sampled conceptually from the submerged pool.
- **Mineral Water:** secondary surfaces, rules, and selected states; never body text on Steam Ivory without contrast verification.
- **Steam Ivory / Towel White:** warm high-key fields derived from towel fibers, vapor, and limestone—not pure digital white.
- **Sandstone:** quiet dividers and large low-contrast surfaces.
- **Eucalyptus:** restrained botanical notation and chapter accents.
- **Oil Amber:** a scarce reflective highlight for progress and active controls, not a general CTA color.
- **Skin Clay:** supporting warmth used in imagery-adjacent fields only.
- **Ink / Quiet Ink:** readable text on light surfaces.

The system moves by region: towel-white opening, warm oil and sandstone transition, deep-water immersion, then a balanced candlelit close. Avoid scattering all colors across every section.

## Typography

Bellefair is the display face because its open, engraved forms echo resort wayfinding and stone inscription without leaning on italic “wellness editorial” clichés. Albert Sans carries body copy and controls with clear contemporary construction.

Display copy stays short, upright, and spacious. Body measure is capped near 65 characters. Labels use modest tracking only where they function as navigation or controls; chapter headings are not prefixed by ornamental numbering.

## Layout

The landing page is a continuous vertical journey with a sticky film plane and text chapters crossing the frame at materially distinct depths. It refuses the standard hero → feature cards → testimonial strip → CTA pattern.

- Opening: one viewport dominated by the film and a low waterline composition.
- Descent: four narrative passages aligned to towel, oil, vapor, and water.
- Return: a quiet, light-toned commercial close and inquiry form.
- Prompt archive: a readable technical document using the same tokens without cinematic obstruction.

Spacing follows a 4px base. Dense passages are followed by real quiet. Mobile reflows to a stable film header plus linear chapter content; no horizontal scrolling or clipped actions.

## Elevation & Depth

Depth comes from real video, translucent color veils, hairline refraction, and controlled overlap—not generic glass cards or diffuse glow. Shadows are rare and low-chroma. Borders should read like waterlines or stone joints.

## Shapes

Controls are capsule-shaped because they reference droplets and expanding ripples. Content regions remain rectilinear and architectural. Avoid excessive rounded containers, blobs, decorative sparkles, and floating pill collections.

## Components

- Navigation is an edge-aligned, translucent waterline with explicit native links and scoped `hx-boost`.
- Chapter details are server-rendered fragments placed beside their activating links, with useful native destination fallbacks.
- Buttons have visible default, hover, focus, active, disabled, loading, error, and success states.
- Form feedback is returned by the server into a polite live region. Errors remain adjacent to their fields.
- Guided Tour controls are compact transport controls, not a media-player imitation; they pause on manual input.

## Do's and Don'ts

Do:
- Keep content visible before enhancement.
- Let motion follow the film’s constant forward glide and expanding ripple.
- Use large color fields and quiet transitions.
- Preserve exact video duration from metadata.
- Make the commercial action legible within seconds.

Don’t:
- Invent testimonials, awards, properties, metrics, prices, or availability.
- Use HTMX for video seeking or continuous animation.
- Use beige-and-italic-serif shorthand for “luxury spa.”
- Add fantasy particles, excessive glow, fake glass dashboards, or generic feature cards.
- Hide navigation, chapter meaning, or the inquiry path behind JavaScript.
