# Interface

How screens should look and behave. R30 to R32 in core-rules.md are the floor.

Evidence: the owner's stated preference (`requirement`), a project's tested layout lessons (`code`), and the WCAG 2.2 success criteria named below (published standard).

## Buttons and labels

- One to three words, verb first where it is an action: "Save", "Join trip", "Add stop".
- An icon beside the label when it helps scanning. Icons never stand alone on actions that change data.
- One primary button per view. Secondary actions are quieter (outline or text).
- Touch targets at least 44 by 44 points (Apple's guidance). WCAG 2.2 sets 24 by 24 as the floor (2.5.8).
- Test the longest label in every language and state at 320 and 390 px wide. A long label must never push the page sideways.

## Longer explanations: tips that work everywhere

A hover-only tooltip fails on phones and keyboards. Use a small info button (a toggletip) next to the label:

- Opens on hover, on tap, and on keyboard focus plus Enter or Space.
- Stays open while the pointer is over it; closes on Escape, on tap outside, or on a second tap. This meets WCAG 1.4.13 (content on hover or focus: dismissible, hoverable, persistent).
- The tip text is in the page for screen readers (`aria-describedby` or a live region), not only in a title attribute.
- Short: one or two sentences. If it needs more, it belongs on its own screen.
- Opening a tip never shifts the layout. It floats over content.

## Clean, Apple-style visuals

- System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`) unless the project has a brand font.
- Generous whitespace, an 8-point spacing scale, one accent color, and plain backgrounds.
- Hierarchy through size and weight, not boxes and borders.
- Motion is short (150 to 250 ms), purposeful, and off when `prefers-reduced-motion` is set.
- Dark mode reads every color from tokens, never hardcoded.

## Things that must never happen

- Something a person taps moves the page.
- A label gives the answer away before it is chosen.
- Text only in color. Pair color with an icon or word.
- Inline styles or scripts under a strict CSP. Use classes.

## Checks

axe at 1280 and 390 px with zero violations (R32), render screenshots at both widths, and a planned lint for label length (three words) on button elements.
