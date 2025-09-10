## YAML Scene Syntax Guide

This guide explains how to author scenes in YAML. It covers scene structure, elements, layout, styling, animations, shortcuts, grouping, timing rules, 3D, and practical recipes.

### Quick start

Create a YAML file (for example `public/scene.yaml`) with either a single `scene` or multiple `scenes` at the top level.

```yaml
scene:
  name: Demo
  width: 1280
  height: 720
  fps: 60
  background: "#101214"
  elements:
    - type: group
      full: true
      column: true
      gap: 16
      padding: [48]
      children:
        - type: text
          txt: "Hello, YAML!"
          fs: 64
          color: "#fff"
          fadeIn: {duration: 0.6}
        - type: rect
          w: 400
          h: 10
          bg: "#2e7"
          slideUp: {distance: 30, duration: 0.5}
```

Open the app; the parser will build a React component for the scene and infer the duration from your animations when `duration` is not specified.

---

### Preview workflow

- The app loads a YAML file path configured in `aivideo/src/App.jsx`. Change the fetch path there (e.g., `public/scene.yaml`, `public/test5.yaml`) to preview a different file.
- Use the buttons in the UI to export live parser metadata via `exportParserSyntax('yaml'|'json')` for a machine-readable reference.
- YAML notes: Strings that represent percents must be quoted (e.g., `"50%"`). Arrays use standard YAML list syntax. Comments start with `#`.

---

### Top-level structure

- `scene`: A single scene definition.
- `scenes`: An array of scenes; the first scene will be used by default.

Common scene fields:
- `id`: Optional string
- `name`: Optional string
- `background`: CSS color string
- `width`, `height`: Numbers (pixels). If omitted, the size is inferred from the first element if it has numeric size; otherwise defaults to 1280×720.
- `fps`: Number. Default 60.
- `duration`: Number of seconds. Optional; if omitted, duration is computed from animation steps, with a minimum of 6 seconds.
- `perspective`: Number (pixels). Controls the 3D perspective of the scene. Default 800.
- `timeline`: Optional timeline configuration (see Timeline and scheduling). Supports two forms: object `{events: [...]}` or direct array `[...]`.
- `camera`: Optional camera block.
- `elements`: Array of element nodes.

Example:
```yaml
scene:
  id: hero
  name: "Hero Section"
  background: "#0b0d0e"
  width: 1920
  height: 1080
  fps: 60
  perspective: 1000
  camera:
    initial: {x: 0, y: 0, scale: 1, rotation: 0}
  elements: []
```

---

### Camera

The camera wraps the whole scene. It supports initial transforms and animations.

- `initial`: `{x?: number, y?: number, z?: number, scale?: number, rotation?: number}`
- `animations`: Use anime steps for camera transforms (`x`, `y`, `z`, `scale`, `rotation`).

```yaml
scene:
  camera:
    initial: {x: 0, y: 0, z: 0, scale: 1, rotation: 0}
    animations:
      - steps:
          - type: anime
            duration: 2
            props:
              scale: {from: 1, to: 1.1, ease: inOutQuad}
              x: {to: 50}
              y: {to: -30}
```

Notes:
- `focus` steps are recognized for timing but have no visual effect yet.
- Camera transforms multiply with element transforms, affecting the whole scene.
- `perspective` applies at the scene container; 3D is always active and preserved down the tree so children can use `z` and containers render in 3D space.

---

### Elements

Supported `type` values: `text`, `image`, `rect`, `circle`, `path`, `group`.

Common fields across elements:
- `id`, `name`: Strings
- `visible`: Boolean (if false, element is not rendered)
- `locked`: Boolean (reserved; no special behavior in renderer)
- `positioning`: `{mode?: 'layout' | 'absolute' | 'relative'}`. Default `layout`.
- `position`: `{x?: number | "N%", y?: number | "N%", unit?: 'px' | 'percent' | 'canvas'}`
- `x`, `y`: Shorthand for `position.x` and `position.y`
- `size`: `{width?: number | "N%", height?: number | "N%", unit?: 'px' | 'percent' | 'auto'}`
- `w`, `h`, `square`: Size shorthands
- `layout`: Container layout (see Layout)
- `layoutItem`: Item-specific layout (see Layout item)
- `style`: Visual properties (see Styling)
- `animations`: Array of animations (see Animations)
- `children`: Array of child elements
- `index`: Number used as CSS `z-index`
- `z`: Number used as 3D `translateZ` and as `z-index` fallback

Type-specific notes:
- `text`: Renders inside a `div`. Uses `style.color` (falls back to `style.fill`) and font settings.
- `image`: Renders an `img` inside a container `div`. The container can have size; the `img` fills it with `object-fit: cover`.
- `rect`: Use `bg`/`style.fill` to fill background color; optional `stroke` for border.
- `circle`: Same as `rect` but with full border radius.
- `group`: Always acts as a container. Flex container defaults apply; 3D is preserved.

---

### Positioning and size

- Default `positioning.mode` is `layout`. Use `absolute` for absolute left/top coordinates, or `relative` for offsetting within the layout flow.
- Numbers are pixels. Percent values are strings like `"50%"`.
- With `absolute` positioning and percent-based `x` or `y`, the element is auto-centered via `translate(-50%, -50%)` so `{x: '50%', y: '50%'}` centers the element.
- Size can be numbers (pixels) or percent strings. Width/height can be animated (in pixels).

Shortcuts:
- `abs: true` → `positioning.mode: 'absolute'`
- `rel: true` → `positioning.mode: 'relative'`
- Position presets: `center`, `topLeft`, `topRight`, `bottomLeft`, `bottomRight`
- Size presets: `fullWidth`, `fullHeight`, `full`, `square: number`
- Dimension shorthands: `w`, `h`

Example:
```yaml
- type: rect
  abs: true
  center: true     # same as x: '50%', y: '50%'
  square: 200
  bg: '#335'
```

Edge cases and tips:
- Percent `x`/`y` should be quoted; numbers are treated as pixels.
- `size.unit` is accepted but not required; pixels are implied for numbers.
- Animating `width`/`height` uses pixel values; percent widths/heights are not tweened.

---

### Layout (containers)

Any element with a `layout` block (and all `group` elements) becomes a flex container:
- `type`: `row` | `column` (default `column`)
- `gap`: number | [row, column] | {row, column}
- `padding`: number[] (CSS shorthand: [t], [v,h], [t,h,b], [t,r,b,l])
- `align`: `start` | `center` | `end` | `stretch` | `baseline` → maps to `align-items`
- `justify`: `start` | `center` | `end` | `space-between` | `space-around` → maps to `justify-content`
- `wrap`: `wrap` | `nowrap` | `wrap-reverse`

Defaults:
- If no `align` is provided, `row` containers default to `align-items: center`, `column` to `align-items: flex-start`.
- `justify` defaults to `flex-start`.
- 3D rendering: Containers and elements render with `transform-style: preserve-3d` so `z` depth is respected.

Shortcuts:
- `flex: true` → `layout.type: 'row'`
- `flexCol: true` → `layout.type: 'column'`
- `centerItems: true` → `align: 'center'`, `justify: 'center'`
- `spaceBetween: true` → `justify: 'space-between'`
- `spaceAround: true` → `justify: 'space-around'`
- `alignStart|alignCenter|alignEnd|alignBaseline`
- `justifyStart|justifyCenter|justifyEnd`
- `p` is a shorthand for `layout.padding`

Layout item fields (applied to children):
- `layoutItem.order`: number
- `layoutItem.alignSelf`: `auto` | `start` | `center` | `end` | `stretch`
- `layoutItem.margin`: `{top?, right?, bottom?, left?}` (pixels)

Best practice: Prefer layout containers over absolute positioning for structured UI.

---

### Styling

`style` supports:
- `fill`: background color (ignored for `image` containers)
- `color`: text color (used by `text`)
- `stroke`: `{color?: string, width?: number}` → mapped to CSS `border`
- `font`: `{family?: string, size?: number, weight?: 'normal' | 'bold'}`
- `opacity`: number (0–1), also animatable
 - Note: You can animate visual effects via anime/tweens using these property names:
   - Radius: `radius` (uniform), or per-corner `radius.tl`, `radius.tr`, `radius.br`, `radius.bl`
   - Blur: `blur` (pixels)
   - Box shadow: `shadow.x`, `shadow.y`, `shadow.blur`, `shadow.spread`, `shadow.color`
   - Colors: `fill`, `color`, `stroke.color`

Shorthands:
- `bg` → `style.fill`
- `color` → `style.color`
- `ff` → `style.font.family`
- `fs` → `style.font.size`
- `fw` → `style.font.weight`
- `txt` → `text`

Rendering details:
- `image` uses `object-fit: cover`; to see the image, ensure its container has `w`/`h` or inherits size.
- `stroke` is mapped to `border: <width> solid <color>` on the element container. `stroke.color` and `stroke.width` are animatable.

---

### Animations

Each element (and the camera) can define `animations` as an array. Each array item is either:
- An object with `steps: [...]`
- A single step object (will be wrapped into `steps`)

Scheduling fields on an animation:
- `on: <eventId>`: Start at the time of a timeline event with that `id`.
- `after: <eventId|animationId>`: Start after an event OR after another animation finishes.
- `delay: <seconds>`: Adds extra delay on top of the resolved time.

Step types:
- `anime`: Primary step type. Supports per-property keyframes, `stagger`, text targets, and children targets.
- `tween` (legacy): Numeric/percent interpolation; retained for compatibility.
- `focus`: Recognized for timing; no visual effect yet
- `css`: Apply CSS keyframe animations

Common step fields:
- `duration`: seconds (optional for anime if property-level durations are provided)
- `delay`: seconds (optional)
- `easing`: supports `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, and extended names: `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeInBounce`, `easeOutBounce`, `easeInOutBounce`.

Anime step structure:
```yaml
- type: anime
  duration: 1.2               # optional; inferred from keyframes if omitted
  props:
    # Per-property values or keyframes
    x: [{from: -40, to: 0, duration: 400, ease: outCubic}]
    opacity: {from: 0, to: 1}
    # Text and children targets
    targets: text.chars | text.words | children
    # Stagger for targets (ms)
    stagger: {each: 60, start: 0}
```

Text targets:
- `targets: text.chars` — split text into characters and animate each with stagger
- `targets: text.words` — split text into words and animate each with stagger

Children target:
- `targets: children` — apply the same anime step to all direct children of a container
- `stagger: {each: N, start: M}` — adds per-child delays (ms). Scene duration accounts for the last child’s extra delay

Sequential vs parallel:
- Put multiple steps inside one `steps` array for sequential motion
- Put multiple animation entries in `animations` for parallel motion

Examples:
```yaml
# Sequential
- steps:
    - {type: anime, duration: 0.4, props: {opacity: {from: 0, to: 1}}}
    - {type: anime, duration: 1.2, props: {x: {from: -80, to: 0}, y: {from: 20, to: 0}, ease: inOutQuad}}
    - {type: anime, duration: 0.3, props: {opacity: {from: 1, to: 0}}}

# Parallel
animations:
  - {steps: [{type: anime, duration: 1.2, props: {opacity: {from: 0, to: 1}}}]}
  - {steps: [{type: anime, duration: 1.2, props: {x: {from: -80, to: 0}, y: {from: 20, to: 0}, ease: inOutQuad}}]}

# Text split + stagger
- type: text
  txt: "chars demo"
  animations:
    - steps:
        - type: anime
          duration: 1.2
          props:
            targets: text.chars
            y:
              - {to: -24, ease: outCubic, duration: 300}
              - {to: 0,  ease: outBounce, duration: 500}
            opacity: [{from: 0, to: 1, duration: 250}]
            stagger: {each: 60, start: 0}

# Children target + stagger (container cascades)
- type: group
  animations:
    - steps:
        - type: anime
          duration: 1.0
          props:
            targets: children
            y: [{from: 16, to: 0, duration: 300, ease: outQuad}]
            opacity: {from: 0, to: 1}
            stagger: {each: 100}
```

Easing and timing rules:
- Tweens/custom use Remotion Easing under the hood (deterministic)
- Anime easing uses normalized tokens mapped to the same Remotion easings (e.g., `easeOutExpo` → `outExpo`). If not specified, the default is `inOutSine`.
- If `duration` is omitted on an anime step, it is inferred from the longest property/keyframe track plus top-level `delay`. If keyframes omit `duration` but the step has `duration`, the step duration is distributed across keyframes.
- Step `delay` is not double-counted; timeline alignment is exact

---

### Timeline and scheduling

You can define named events and express animation ordering relative to events or other animations.

Timeline forms:
- Object form: `{events: [{id, at?, after?, on?, delay?}, ...]}`
- Array form: `[{id, at?, after?, on?, delay?}, ...]`

Event fields:
- `id`: Unique name of the event
- `at`: Absolute time in seconds
- `after`: Chain after another event or after an animation id; when referencing an animation, it resolves to that animation’s end time
- `delay`: Additional seconds added on top of the resolved event time

Animation linking (on elements or camera):
- `on: <eventId>` (or `trigger: <eventId>`) → start at the event time
- `after: <eventId|animationId>` → start after the referenced event or animation finishes
- `delay: <seconds>` → additional delay on top of the resolved time

Authoring rule:
- Put `on` / `after` / `delay` on the animation object, not on individual steps. Steps run sequentially inside the animation and use their own `delay`/`duration` only.

Example (object form):
```yaml
- id: header
  type: group
  animations:
    - id: titleIn
      steps:
        - {type: anime, duration: 0.6, props: {opacity: {from: 0, to: 1}}}
    - {id: subtitleIn, after: titleIn, delay: 0.15, steps: [{type: anime, duration: 0.5, props: {y: {from: 12, to: 0}}}]}
- id: ctas
  type: group
  animations:
    - {id: ctasIn, on: afterTitle, steps: [{type: anime, duration: 0.5, props: {opacity: {from: 0, to: 1}}}]}
scene:
  timeline:
    events:
      - {id: intro, at: 0}
      - {id: afterTitle, after: titleIn}
      - {id: ctas, after: afterTitle, delay: 0.2}
```

Example (array form + event delays):
```yaml
scene:
  timeline:
    - {id: headlineIn, at: 1}
    - {id: subtitleIn, after: headlineIn, delay: 2}
  elements:
    - type: text
      animations:
        - id: headlineIn
          steps:
            - {type: anime, duration: 0.8, props: {opacity: {from: 0, to: 1}}}
    - type: text
      animations:
        - id: subtitleIn
          steps:
            - {type: anime, duration: 0.6, props: {opacity: {from: 0, to: 1}}}
```

Semantics and precedence:
- “after means after done”: `after: <animationId>` resolves to the end time of that animation (its start time plus its own `delay` and step delays + durations).
- If an animation `id` matches an event `id`, the event time schedules it; otherwise use `on`/`after`/`delay` on the animation.
- Event `delay` and animation `delay` both add to the final start time (event delay applies when resolving the event, animation delay applies when scheduling the animation).
- If references cannot be resolved, start time defaults to 0.

---

### Group-level animations and staggering (updated)

Use `targets: children` with an anime step on the parent container to animate all direct children. Provide `stagger` to offset each child in milliseconds. Scene duration accounts for the last child’s extra delay.

Deprecated: `childrenAnimations`, `groupAnimations`, `stagger`, `childrenStagger`.

---

### Layering and 3D

- `index`: Maps to CSS `z-index` for stacking order.
- `z`: If set, used for CSS `translateZ(z)` and as a fallback `z-index` when `index` is not provided; `z` is tweenable.
- Scene-level `perspective`: Controls the 3D perspective (pixels). 3D is preserved on containers and elements; depth and parallax effects are available without extra setup.

Tips:
- To create a parallax effect, vary child `z` values (e.g., back layer `z: -200`, fore layer `z: 200`).
- Avoid extreme `z` without adjusting camera `scale`/`position` as elements may clip out of view.

---

### Duration rules

If `scene.duration` is omitted, the parser computes duration as the maximum total timeline length across:
- All element animations (including inherited group animations and per-child staggering)
- Camera animations
- Timeline schedules (events and `after` relationships)
- Each step’s `delay` and `duration` are accounted for
- Minimum duration is 6 seconds

Debugging timeline length:
- Add a long last tween (e.g., `{duration: 0.01}`) if you need to force the scene longer than the computed minimum.

---

### Type reference (quick)

Enums and lists derived from the parser (subject to introspection at runtime):
- Align: `start`, `center`, `end`, `stretch`, `baseline`
- Justify: `start`, `center`, `end`, `space-between`, `space-around`
- Easing: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInBack`, `easeOutBack`, `easeInOutBack`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeInBounce`, `easeOutBounce`, `easeInOutBounce`
- Layout types: `row`, `column`
- Position units: `px`, `percent`, `canvas` (unit is optional)
- Size units: `px`, `percent`, `auto` (unit is optional)
- Element types: `text`, `image`, `rect`, `circle`, `path`, `group`
- Animatable properties (elements):
  - `opacity`, `x`, `y`, `z`, `rotation`, `scale`, `scale.x`, `scale.y`, `width`, `height`
  - Visual effects: `radius`, `radius.tl`, `radius.tr`, `radius.br`, `radius.bl`, `blur`, `shadow.x`, `shadow.y`, `shadow.blur`, `shadow.spread`, `shadow.color`
  - Colors: `fill`, `color`, `stroke.color`
  - Stroke width: `stroke.width`
  - Path-specific: `dashoffset` (percent supported), `followPathProgress` (0..1)
- Step types: `anime`, `tween` (legacy), `focus`, `css`

Use `exportParserSyntax('yaml'|'json')` for an always-current machine-readable map of keys and enums.

---

### Recipes

1) Centered hero with subtitle and CTA row
```yaml
scene:
  width: 1280
  height: 720
  background: '#0d1117'
  elements:
    - type: group
      full: true
      centerItems: true
      gap: 16
      children:
        - {type: text, txt: 'Build videos as data', fs: 64, fw: bold, color: '#e6edf3', fadeIn: 0.6}
        - {type: text, txt: 'Author scenes in YAML', fs: 28, color: '#9da7b3', slideUp: 20}
        - type: group
          row: true
          gap: 12
          children:
            - {type: rect, w: 160, h: 44, bg: '#238636', scaleIn: {scale: 0.95, duration: 0.25}, children: [{type: text, txt: 'Get started', fs: 18, color: '#fff', layoutItem: {margin: {top: 10, left: 12}}}]}
            - {type: rect, w: 160, h: 44, bg: '#30363d', slideUp: 20, children: [{type: text, txt: 'Docs', fs: 18, color: '#e6edf3', layoutItem: {margin: {top: 10, left: 16}}}]}
```

2) Grid of cards with staggered entrance
```yaml
scene:
  width: 1200
  height: 675
  background: '#101214'
  elements:
    - type: group
      full: true
      column: true
      gap: 24
      padding: [40]
      animations:
        - steps:
            - type: anime
              duration: 0.4
              props:
                targets: children
                y: {from: 20, to: 0}
                opacity: {from: 0, to: 1}
                stagger: {each: 60}
      children:
        - {type: text, txt: 'Features', fs: 40, color: '#fff'}
        - type: group
          row: true
          gap: 16
          wrap: wrap
          children:
            - {type: rect, w: 360, h: 200, bg: '#20262d'}
            - {type: rect, w: 360, h: 200, bg: '#20262d'}
            - {type: rect, w: 360, h: 200, bg: '#20262d'}
            - {type: rect, w: 360, h: 200, bg: '#20262d'}
```

3) Parallax layers with camera scale
```yaml
scene:
  width: 1280
  height: 720
  background: '#000'
  perspective: 900
  camera:
    initial: {scale: 1}
    animations:
      - steps:
          - {type: anime, duration: 2, props: {scale: {from: 1, to: 1.08}, ease: inOutQuad}}
  elements:
    - {type: image, src: '/bg.jpg', full: true, z: -200}
    - {type: image, src: '/mid.png', full: true, z: 0, opacity: 0.9}
    - {type: image, src: '/fg.png', full: true, z: 150}
```

4) Ken Burns (slow pan/zoom) on an image
```yaml
scene:
  width: 1280
  height: 720
  background: '#000'
  elements:
    - type: image
      src: '/photo.jpg'
      w: 1280
      h: 720
      animations:
        - steps:
            - type: anime
              duration: 5
              props:
                scale: {from: 1, to: 1.15, ease: inOutQuad}
                x: {from: -40, to: 40}
                y: {from: 0, to: -20}
```

5) Lower-third overlay using relative positioning in layout flow
```yaml
scene:
  width: 1280
  height: 720
  background: '#111'
  elements:
    - type: group
      full: true
      children:
        - {type: image, src: '/video-frame.jpg', full: true}
        - type: group
          rel: true
          y: 560
          row: true
          gap: 12
          padding: [8, 16]
          children:
            - {type: rect, w: 420, h: 64, bg: '#222', opacity: 0.8}
            - {type: text, txt: 'Speaker Name — Title', fs: 28, color: '#fff', slideUp: 24}
```

---

### Unsupported or currently no-op fields

These exist in the internal types but have limited or no effect:
- Step `type: 'focus'` contributes to timing but does not change the camera view.
- Element `pivot` is not used for transform origin; transforms use center.

If you need any of these, consider composing equivalent effects with available properties (e.g., chain tweens for loops).

---

### Troubleshooting and best practices

- Animations not running:
  - Ensure anime steps specify a `duration` or per-property keyframe durations.
  - Property names must match the supported set exactly (e.g., `scale.x`, not `scalex`).
  - Use numeric values for pixel-based properties; percent values must be strings with `%` where supported (e.g., `dashoffset`).
- Nothing visible on screen:
  - Confirm container sizes. For `image`, set `w`/`h` or ensure a sized parent.
  - Check `visible: false` is not set.
- Overlapping or awkward layout:
  - Prefer layout containers with `row`/`column` and `gap` over absolute positioning.
  - Use `align`/`justify` and `padding` for spacing; avoid magic numbers when possible.
- 3D looks flat:
  - Increase `perspective` or vary element `z` values.
  - 3D is preserved down the tree; ensure `z` is numeric to see depth via `translateZ`.
- Duration is too short/long:
  - Provide `scene.duration` explicitly, or add a final short anime step to extend the computed length.

---

### Exporting syntax metadata (advanced)

For up-to-date, parser-derived syntax metadata, you can call the exporter from code:

```ts
import {exportParserSyntax} from "../src/parser/index";

// YAML (default)
const yaml = exportParserSyntax("yaml");

// Or JSON
const json = exportParserSyntax("json");
```

This exporter introspects the parser to list supported element keys, enums, animatable properties, and shortcuts.

---

### Tips

- Favor layout containers (`group` or any element with `layout`) for structured sections; use `absolute` only for precise overlays.
- Prefer a visible frame gap: Give the main container padding (e.g., `[24,32]` or `[64]`) and non-zero `gap` so content does not touch edges by default.
- Do not change scene resolution: Avoid setting `width`, `height`, or `fps` unless explicitly required. Keep the existing resolution if provided; otherwise defaults apply.
- Use percent strings for relative positioning (`"50%"`) and pixels for absolute sizes and animation deltas.
- `image` elements cover their container (`object-fit: cover`); set `w`/`h` or place inside a sized container.
- Keep anime steps short and focused; sequence multiple steps for complex motion.
- For lists and grids, prefer a parent anime step with `targets: children` and `stagger`.

### Authoring warnings (avoid common errors)
- Tweened transforms `x`/`y`/`width`/`height` must be numeric pixels. Do not use percent strings in tweens (e.g., `x: {from: "25%", to: "75%"}` is invalid). Use pixel values, or animate via a `path` using `followPath`.
- `style` supports only: `fill`, `color`, `stroke`, `font`, `opacity`. Other CSS-like keys (e.g., `border-radius`, `box-shadow`, `filter`) are not recognized.
- Absolute percent positioning (`x: "50%"`, `y: "50%"`) is only for initial placement; do not animate percent `left/top`.
- For path motion, prefer `followPathProgress` via anime and reference a path by id. Inheritance applies for `smooth`, `tension`, `closed`, and `coordSpace` unless overridden.

### Path element

The `path` element renders a polyline/curve (for design) and can be used as a motion guide or for draw-on effects.

Fields:
- `points`: `[[x,y], ...]` or `{x,y}[]` — control points in pixels
- `d`: string — raw SVG path `d` string (alternative to `points`)
- `smooth`: boolean — when `true`, renders a smooth Catmull–Rom-derived bezier curve
- `tension`: number (0..1) — curve tightness used when `smooth: true` (0 = smooth, 1 = straighter)
- `closed`: boolean — close the path (returns to start)
- `coordSpace`: `root | local` — coordinate space for both drawing and motion reference
- `w`, `h` — when `coordSpace: local`, used as the SVG viewBox for scaling
- `style.stroke`: `{color, width}` — stroke color/width
- `style.stroke.dasharray`: number | number[] — dash pattern for path strokes
- `style.stroke.dashoffset`: number — dash offset; can be animated via anime/tween property `dashoffset` (supports percent strings)
- `style.fill`: string — fill color (`none` by default)

Draw-on with dashoffset (anime):
```yaml
- type: path
  id: outline
  smooth: true
  style: {stroke: {color: "#58a6ff", width: 3, dasharray: 600, dashoffset: 600}, fill: none}
  points: [[100,600],[400,120],[800,520],[1100,160]]
  animations:
    - steps:
        - type: anime
          props:
            dashoffset: [{from: "100%", to: "0%", duration: 1200, ease: outCubic}]
```

Motion along path with anime:
- Animate `followPathProgress` (0..1) to move an element along a referenced path
- Optional per-step overrides via anime props:
  - `'followPath.pathId'`, `'followPath.smooth'`, `'followPath.tension'`, `'followPath.closed'`, `'followPath.coordSpace'`, `'followPath.orient'`
- If not provided, these inherit from the referenced path

```yaml
- type: circle
  animations:
    - steps:
        - type: anime
          props:
            followPathProgress: [{from: 0, to: 1, duration: 2000, ease: easeInOutSine}]
            'followPath.pathId': outline
            'followPath.orient': true
```

Notes:
- Elements following a path are positioned absolutely at their parent origin so transforms place them precisely on the path
- `coordSpace: local` offsets motion using the element’s numeric `x/y` as local origin

---

### Layout guidance to avoid stacking full elements
- Avoid placing multiple `full: true` (or `w: '100%', h: '100%'`) elements as siblings in the same flow container. They will stack vertically and push each other.
- Preferred pattern:
  - One flow root container (`group`, `flexCol: true`, `full: true`) for structured content.
  - Additional full-frame visuals (backgrounds, overlays, effects) as `abs: true` children with `full: true`.
- For backgrounds, put a single full `rect/image` at the top (or `abs` with `z`), not multiple full blocks in flow.
