import React, {CSSProperties, useMemo} from 'react'
import {interpolate, useCurrentFrame, Easing} from 'remotion'
import YAML from 'yaml'
import {createTimeline, stagger as animeStagger} from 'animejs'
// Types describing the YAML schema

type PercentString = `${number}%`

type EasingName = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'ease' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce' | string

type TweenProperties = Record<string, {from?: number | PercentString; to: number | PercentString}>

type TweenStep = {
	type: 'tween'
	duration: number
	delay?: number
	easing?: EasingName
	properties: TweenProperties
}

type CameraFocusStep = {
	type: 'focus'
	target: string
	duration: number
	delay?: number
	easing?: EasingName
	zoom?: number
	offset?: {x?: number; y?: number}
}

type CustomStep = {
	type: 'custom'
	name: string
	duration: number
	delay?: number
	easing?: EasingName
	params?: Record<string, unknown>
}

type CssStep = {
	type: 'css'
	name: string
	duration: number
	delay?: number
	timingFunction?: string
	iterationCount?: number | 'infinite'
	fillMode?: string
	direction?: string
	playState?: string
}

type AnimeStep = {
	type: 'anime'
	// Optional explicit duration for scene length; otherwise we try to infer from props
	duration?: number
	delay?: number
	// Pass-through to anime timeline.add(target, props, positionMs)
	props: Record<string, any>
}

type Animation = {
	id?: string
	trigger?: 'start' | string
	delay?: number
	loop?: 'none' | 'loop' | 'pingpong'
	steps: (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[]
	after?: string
	on?: string
}

type StrokeStyle = {color?: string; width?: number; dasharray?: number | number[]; dashoffset?: number}

type FontStyle = {family?: string; size?: number; weight?: 'normal' | 'bold'}

type CommonStyle = {
	fill?: string
	color?: string
	stroke?: StrokeStyle
	font?: FontStyle
	opacity?: number
}

type Positioning = {mode?: 'layout' | 'absolute' | 'relative'}

type Position = {x?: number | PercentString; y?: number | PercentString; unit?: 'px' | 'percent' | 'canvas'}

type Size = {width?: number | PercentString; height?: number | PercentString; unit?: 'px' | 'percent' | 'auto'}

type LayoutItem = {
	order?: number
	alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch'
	margin?: {top?: number; right?: number; bottom?: number; left?: number}
}

type Layout = {
	type?: 'row' | 'column'
	gap?: number | [number, number] | {row: number; column: number}
	padding?: number[]
	align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
	justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
	wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
	clip?: boolean
}

type BaseElement = {
	id?: string
	name?: string
	visible?: boolean
	locked?: boolean
	positioning?: Positioning
	position?: Position
	pivot?: {x?: number; y?: number}
	size?: Size
	layoutItem?: LayoutItem
	layout?: Layout
	style?: CommonStyle
	animations?: Animation[]
	children?: ElementNode[]
	stagger?: number
	childrenAnimations?: Animation[]
	z?: number | 'auto'
	index?: number
}

type RectElement = BaseElement & {type: 'rect'}
type CircleElement = BaseElement & {type: 'circle'}
type TextElement = BaseElement & {type: 'text'; text?: string}
type ImageElement = BaseElement & {type: 'image'; src?: string}
type PathElement = BaseElement & {type: 'path'; points?: Array<{x: number; y: number}> | number[][]; d?: string; closed?: boolean; smooth?: boolean; tension?: number; coordSpace?: 'root' | 'local'}
type GroupElement = BaseElement & {type: 'group'}
export type ElementNode = RectElement | CircleElement | TextElement | ImageElement | PathElement | GroupElement

type Camera = {
	initial?: {x?: number; y?: number; z?: number; scale?: number; rotation?: number}
	animations?: Animation[]
}

type TimelineEvent = {id: string; at?: number; after?: string; on?: string; delay?: number}

type Scene = {
	id?: string
	name?: string
	background?: string
	width?: number
	height?: number
	fps?: number
	duration?: number // seconds (optional)
	camera?: Camera
	elements?: ElementNode[]
	perspective?: number
	timeline?: {events?: TimelineEvent[]} | TimelineEvent[]
}



const mapEasing = (name?: EasingName) => {
	if (!name) return Easing.linear
	switch (name) {
		case 'linear':
			return Easing.linear
		case 'ease':
			return Easing.ease
		case 'easeIn':
			return Easing.in(Easing.quad)
		case 'easeOut':
			return Easing.out(Easing.quad)
		case 'easeInOut':
			return Easing.inOut(Easing.quad)
		case 'easeInQuad':
			return Easing.in(Easing.quad)
		case 'easeOutQuad':
			return Easing.out(Easing.quad)
		case 'easeInOutQuad':
			return Easing.inOut(Easing.quad)
		case 'easeInCubic':
			return Easing.in(Easing.cubic)
		case 'easeOutCubic':
			return Easing.out(Easing.cubic)
		case 'easeInOutCubic':
			return Easing.inOut(Easing.cubic)
		case 'easeInSine':
			return Easing.in(Easing.sin)
		case 'easeOutSine':
			return Easing.out(Easing.sin)
		case 'easeInOutSine':
			return Easing.inOut(Easing.sin)
		case 'easeInBack':
			return Easing.in(Easing.back())
		case 'easeOutBack':
			return Easing.out(Easing.back())
		case 'easeInOutBack':
			return Easing.inOut(Easing.back())
		case 'easeInExpo':
			return Easing.in(Easing.exp)
		case 'easeOutExpo':
			return Easing.out(Easing.exp)
		case 'easeInOutExpo':
			return Easing.inOut(Easing.exp)
		case 'easeInBounce':
			return Easing.in(Easing.bounce)
		case 'easeOutBounce':
			return Easing.out(Easing.bounce)
		case 'easeInOutBounce':
			return Easing.inOut(Easing.bounce)
		default:
			return Easing.linear
	}
}

const toPercentNumber = (val: number | PercentString | undefined): number | undefined => {
	if (val == null) return undefined
	if (typeof val === 'number') return val
	const m = /^(-?\d+(?:\.\d+)?)%$/.exec(val)
	return m ? parseFloat(m[1]) : undefined
}

const toCssPercentOrPx = (val: number | PercentString | undefined): string | undefined => {
	if (val == null) return undefined
	if (typeof val === 'number') return `${val}px`
	return val
}

const getGap = (gap: Layout['gap']): {row: number; column: number} => {
	if (gap == null) return {row: 0, column: 0}
	if (typeof gap === 'number') return {row: gap, column: gap}
	if (Array.isArray(gap)) return {row: gap[0] ?? 0, column: gap[1] ?? gap[0] ?? 0}
	return {row: gap.row ?? 0, column: gap.column ?? 0}
}

// --- Path helpers: Cardinal/Catmull-Rom smoothing with tension and SVG path building ---
const sampleCatmullRom = (points: {x: number; y: number}[], closed: boolean = false, subdivisions: number = 20, tension: number = 0): {x: number; y: number}[] => {
	const pts = points.slice()
	if (pts.length < 2) return pts
	const res: {x: number; y: number}[] = []
	const getP = (i: number) => {
		if (closed) {
			const idx = (i + pts.length) % pts.length
			return pts[idx]
		}
		if (i < 0) return pts[0]
		if (i >= pts.length) return pts[pts.length - 1]
		return pts[i]
	}
	// Tension mapping: 0 => Catmull-Rom (c=0), 1 => nearly straight segments
	const c = Math.max(0, Math.min(1, tension))
	for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
		const p0 = getP(i - 1)
		const p1 = getP(i)
		const p2 = getP(i + 1)
		const p3 = getP(i + 2)
		for (let j = 0; j <= subdivisions; j++) {
			const t = j / subdivisions
			const t2 = t * t
			const t3 = t2 * t
			// Cardinal spline basis with tension c: 0..1
			const b0 = -c * t + 2 * c * t2 - c * t3
			const b1 = 1 + (c - 3) * t2 + (2 - c) * t3
			const b2 = c * t + (3 - 2 * c) * t2 + (c - 2) * t3
			const b3 = -c * t2 + c * t3
			const x = b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x
			const y = b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y
			res.push({x, y})
		}
	}
	return res
}

const buildBezierPathFromPoints = (points: {x: number; y: number}[], closed: boolean = false, tension: number = 0): string => {
	if (points.length === 0) return ''
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
	const getP = (i: number) => {
		if (closed) return points[(i + points.length) % points.length]
		if (i < 0) return points[0]
		if (i >= points.length) return points[points.length - 1]
		return points[i]
	}
	let d = `M ${points[0].x} ${points[0].y}`
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = getP(i - 1)
		const p1 = getP(i)
		const p2 = getP(i + 1)
		const p3 = getP(i + 2)
		const cFactor = (1 - Math.max(0, Math.min(1, tension))) / 6 // tension 0 -> factor 1/6, tension 1 -> 0
		const c1x = p1.x + (p2.x - p0.x) * cFactor
		const c1y = p1.y + (p2.y - p0.y) * cFactor
		const c2x = p2.x - (p3.x - p1.x) * cFactor
		const c2y = p2.y - (p3.y - p1.y) * cFactor
		d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
	}
	if (closed) d += ' Z'
	return d
}


// Compute animated numeric value from steps
const computeAnimated = (
	steps: readonly (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[] | undefined,
	property: string,
	frame: number,
	fps: number,
	initial?: number,
	initialOffsetFrames: number = 0
): number | undefined => {
	if (!steps) return initial
	let current: number | undefined = initial
	let timeCursor = initialOffsetFrames
	for (const step of steps as any) {
		if (!step) continue
		const delay = Math.round(((step as any).delay ? ((step as any).delay as number) : 0) * fps)
		timeCursor += delay
		if ((step as any).type === 'anime') {
			// anime steps are evaluated via timeline; skip here
		} else if (step.type === 'tween') {
			const tween = step as TweenStep
			const durationFrames = Math.max(1, Math.round(tween.duration * fps))
			const easingFn = mapEasing(tween.easing)
			const prop = tween.properties ? tween.properties[property] : undefined
			if (prop) {
				const from = typeof prop.from === 'string' ? parseFloat(prop.from) : (prop.from as number | undefined)
				const to = typeof prop.to === 'string' ? parseFloat(prop.to) : (prop.to as number)
				if (frame < timeCursor) {
					// keep current before this step starts; if undefined, set a baseline
					if (current === undefined) current = (from ?? to)
				} else if (frame >= timeCursor && frame < timeCursor + durationFrames) {
					const t = (frame - timeCursor) / durationFrames
					current = interpolate(t, [0, 1], [from ?? current ?? to, to], {easing: easingFn, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
				} else {
					current = to
				}
			}
			timeCursor += durationFrames
		} else {
			// Non-tween steps (custom/css/focus) should advance the local timeline so later tweens start after them
			const durSec = (step as any).duration as number | undefined
			if (durSec && durSec > 0) {
				const durationFrames = Math.max(1, Math.round(durSec * fps))
				timeCursor += durationFrames
			}
		}
	}
	return current
}

const computeMaxDurationFrames = (scene: Scene, fps: number): number => {
	let maxFrames = 0

	const animEnd = (start: number, anim: Animation) => start + getAnimationDurationFrames(anim, fps)

	const registry = collectAnimationRegistry(scene)

	const walk = (
		nodes: ElementNode[] | undefined,
		inheritedSteps: (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[] = [],
		baseOffsetFrames: number = 0
	) => {
		if (!nodes) return
		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i]
			const scheduled = scheduleAnimations(n.animations, fps, scene.timeline, registry)

			if (inheritedSteps.length > 0) {
				const pseudo: Animation = {steps: inheritedSteps}
				maxFrames = Math.max(maxFrames, animEnd(baseOffsetFrames, pseudo))
			}

			for (const s of scheduled) {
				maxFrames = Math.max(maxFrames, animEnd(baseOffsetFrames + s.startFrame, s.anim))
			}

			const passDownSteps = [...inheritedSteps]
			// Account for anime steps on this node that target children with stagger
			if ((n as any).children && (n as any).children.length > 0) {
				const childCount = (n as any).children.length
				for (const s of scheduled) {
					let timeCursor = s.startFrame
					for (const st of (s.anim?.steps || []) as any[]) {
						const stDelayFrames = Math.round((((st?.delay ?? 0) as number) * fps))
						timeCursor += stDelayFrames
						if ((st as any).type === 'anime' && st?.props && String(st.props.targets) === 'children') {
							const raw = (st as any).props || {}
							const props: any = normalizeAnimeProps({...raw})
							const explicitDuration = (st as any).duration as number | undefined
							const durationFrames = explicitDuration != null ? Math.max(1, Math.round(explicitDuration * fps)) : Math.max(0, Math.round((computeAnimePropsDurationMs(props) / 1000) * fps))
							const staggerSpec = props.stagger
							let eachMs = 0
							let startMs = 0
							if (typeof staggerSpec === 'number') {
								eachMs = staggerSpec
							} else if (staggerSpec && typeof staggerSpec === 'object') {
								eachMs = Number(staggerSpec.each ?? 50)
								startMs = Number(staggerSpec.start ?? 0)
							}
							const lastExtraFrames = Math.round(((startMs + eachMs * Math.max(0, childCount - 1)) / 1000) * fps)
							const endFrames = baseOffsetFrames + timeCursor + durationFrames + lastExtraFrames
							maxFrames = Math.max(maxFrames, endFrames)
						}
						// advance timeCursor by this step's duration
						const durSec = (st as any)?.duration as number | undefined
						if ((st as any).type === 'tween') {
							timeCursor += Math.max(1, Math.round(((st as any).duration as number) * fps))
						} else if ((st as any).type === 'anime') {
							if (durSec != null) timeCursor += Math.max(1, Math.round(durSec * fps))
							else {
								const ms = computeAnimePropsDurationMs(normalizeAnimeProps({...((st as any).props || {})}))
								if (ms > 0) timeCursor += Math.round((ms / 1000) * fps)
							}
						} else if (durSec && durSec > 0) {
							timeCursor += Math.max(1, Math.round(durSec * fps))
						}
					}
				}
			}
			if (n.children && n.children.length > 0) {
				for (let c = 0; c < n.children.length; c++) {
					walk([n.children[c]], passDownSteps, baseOffsetFrames)
				}
			}
		}
	}

	walk(scene.elements, [], 0)
	const camSched = scheduleAnimations(scene.camera?.animations, fps, scene.timeline, registry)
	for (const s of camSched) maxFrames = Math.max(maxFrames, animEnd(s.startFrame, s.anim))

	return Math.max(maxFrames, Math.round(6 * fps))
}

const mapAlign = (align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline') => {
	switch (align) {
		case 'start':
			return 'flex-start'
		case 'center':
			return 'center'
		case 'end':
			return 'flex-end'
		case 'stretch':
			return 'stretch'
		case 'baseline':
			return 'baseline'
		default:
			return undefined
	}
}

const mapJustify = (j?: Layout['justify']) => {
	switch (j) {
		case 'start':
			return 'flex-start'
		case 'center':
			return 'center'
		case 'end':
			return 'flex-end'
		case 'space-between':
			return 'space-between'
		case 'space-around':
			return 'space-around'
		default:
			return undefined
	}
}

const paddingArrayToCss = (arr?: number[]): string | undefined => {
	if (!arr || arr.length === 0) return undefined
	if (arr.length === 1) return `${arr[0]}px`
	if (arr.length === 2) return `${arr[0]}px ${arr[1]}px`
	if (arr.length === 3) return `${arr[0]}px ${arr[1]}px ${arr[2]}px`
	return `${arr[0]}px ${arr[1]}px ${arr[2]}px ${arr[3]}px`
}

type AnimRegistry = Map<string, Animation>
type PathInfo = {points?: {x:number;y:number}[]; closed?: boolean; tension?: number; smooth?: boolean; coordSpace?: 'root' | 'local'}
type PathRegistry = Map<string, PathInfo>

const ElementRenderer: React.FC<{node: ElementNode; fps: number; parentSize: {w: number; h: number}; offsetFrames?: number; inheritedSteps?: (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[]; timeline?: Scene['timeline']; animRegistry?: AnimRegistry; pathRegistry?: PathRegistry}> = ({node, fps, parentSize, offsetFrames = 0, inheritedSteps = [], timeline, animRegistry, pathRegistry}) => {
	const frame = useCurrentFrame()
	if (node.visible === false) return null

	const positioningMode = node.positioning?.mode ?? 'layout'

	// Animated properties (timeline-only ordering)
	const scheduled = scheduleAnimations(node.animations, fps, timeline, animRegistry)
	const inherited: ScheduledAnim[] = inheritedSteps.length > 0 ? [{startFrame: offsetFrames, anim: {steps: inheritedSteps} as Animation}] : []
	const scheduleWithOffsets = [...inherited, ...scheduled.map((s) => ({startFrame: s.startFrame + offsetFrames, anim: s.anim}))]

	// Helper: Resolve step-level scheduling overrides (on/after/at)
	const resolveStepStartFrame = React.useCallback((st: any, baseStartFrame: number): number => {
		let start = baseStartFrame
		const events = normalizeTimeline(timeline)
		const eventById = new Map<string, TimelineEvent>()
		for (const ev of events) eventById.set(ev.id, ev)
		const resolveEventLocal = (id: string): number => {
			const ev = eventById.get(id)
			if (!ev) return 0
			if ((ev as any).at != null) {
				const delays = Math.max(0, Math.round((((ev as any).delay ?? 0) as number) * fps))
				return Math.max(0, Math.round(((ev as any).at as number) * fps)) + delays
			}
			if ((ev as any).after) {
				const dep = eventById.get((ev as any).after as string)
				if (dep) {
					const base = resolveEventLocal((ev as any).after as string)
					return base + Math.max(0, Math.round((((ev as any).delay ?? 0) as number) * fps))
				}
				if (animRegistry && animRegistry.has((ev as any).after as string)) {
					const a = animRegistry.get((ev as any).after as string)!
					const depStart = resolveAnimLocal((ev as any).after as string)
					const depEnd = depStart + getAnimationDurationFrames(a, fps)
					return depEnd + Math.max(0, Math.round((((ev as any).delay ?? 0) as number) * fps))
				}
			}
			return 0
		}
		const cacheAnim = new Map<string, number>()
		const resolveAnimLocal = (id: string): number => {
			if (cacheAnim.has(id)) return cacheAnim.get(id)!
			if (!animRegistry) { cacheAnim.set(id, 0); return 0 }
			if (animRegistry.has(id)) {
				const a = animRegistry.get(id)!
				const trig = (a.on ?? (a.trigger && a.trigger !== 'start' ? a.trigger : undefined)) as string | undefined
				if (trig) {
					const base = resolveEventLocal(trig)
					const withDelay = base + Math.round((((a.delay ?? 0) as number) * fps))
					cacheAnim.set(id, withDelay); return withDelay
				}
				if (a.after) {
					if (animRegistry.has(a.after)) {
						const depStart = resolveAnimLocal(a.after)
						const depEnd = depStart + getAnimationDurationFrames(animRegistry.get(a.after)!, fps)
						const withDelay = depEnd + Math.round((((a.delay ?? 0) as number) * fps))
						cacheAnim.set(id, withDelay); return withDelay
					}
					const base = resolveEventLocal(a.after)
					const withDelay = base + Math.round((((a.delay ?? 0) as number) * fps))
					cacheAnim.set(id, withDelay); return withDelay
				}
			}
			cacheAnim.set(id, 0); return 0
		}
		if (st && typeof st === 'object') {
			if ((st as any).on) {
				start = resolveEventLocal(String((st as any).on))
			} else if ((st as any).after) {
				const ref = String((st as any).after)
				if (animRegistry && animRegistry.has(ref)) {
					const depStart = resolveAnimLocal(ref)
					const depEnd = depStart + getAnimationDurationFrames(animRegistry.get(ref)!, fps)
					start = depEnd
				} else {
					start = resolveEventLocal(ref)
				}
			} else if ((st as any).at != null) {
				start = baseStartFrame + Math.max(0, Math.round((((st as any).at as number) * fps)))
			}
			// finally, delay
			start += Math.max(0, Math.round((((st as any).delay ?? 0) as number) * fps))
		}
		return start
	}, [animRegistry, fps, timeline])

	// Build anime.js timeline per element (memoized)
	const animeState = React.useMemo(() => {
		const tl: any = createTimeline({autoplay: false} as any)
		const target: Record<string, any> = {
			opacity: (node as any).style?.opacity ?? 1,
			x: typeof (node as any).position?.x === 'number' ? (node as any).position?.x : 0,
			y: typeof (node as any).position?.y === 'number' ? (node as any).position?.y : 0,
			z: typeof (node as any).z === 'number' ? (node as any).z : 0,
			rotation: 0,
			'scale': 1,
			'scale.x': 1,
			'scale.y': 1,
			'width': typeof (node as any).size?.width === 'number' ? (node as any).size?.width : undefined,
			'height': typeof (node as any).size?.height === 'number' ? (node as any).size?.height : undefined,
			'fill': (node as any).style?.fill,
			'color': (node as any).style?.color,
			'stroke.color': (node as any).style?.stroke?.color,
			'stroke.width': (node as any).style?.stroke?.width,
			'radius': undefined,
			'radius.tl': undefined,
			'radius.tr': undefined,
			'radius.br': undefined,
			'radius.bl': undefined,
			'blur': undefined,
			'shadow.x': undefined,
			'shadow.y': undefined,
			'shadow.blur': undefined,
			'shadow.spread': undefined,
			'shadow.color': undefined,
			'dashoffset': undefined,
		}
		// Prime target with 'from' values of the earliest anime steps to avoid pre-start jumps
		const primed = new Set<string>()
		const primeFrom = (key: string, value: any) => {
			if (value == null) return
			if (primed.has(key)) return
			// Set even if target has another default to ensure pre-start matches first keyframe
			target[key] = value
			primed.add(key)
		}
		for (const {startFrame, anim} of scheduleWithOffsets) {
			for (const st of (anim.steps || []) as any[]) {
				if ((st as any).type !== 'anime') continue
				const raw = (st as any).props || {}
				const props: any = normalizeAnimeProps({...raw})
				for (const k of Object.keys(props)) {
					if (k === 'targets' || k === 'stagger' || k === 'ease' || k === 'easing' || k === 'duration' || k === 'delay' || k === 'loop' || k === 'loopDelay' || k === 'direction' || k === 'autoplay') continue
					const v = (props as any)[k]
					if (Array.isArray(v)) {
						const first = v[0]
						if (first && typeof first === 'object' && first.from != null) primeFrom(k, first.from)
					} else if (v && typeof v === 'object') {
						if ((v as any).from != null) primeFrom(k, (v as any).from)
					}
				}
			}
		}
		// flatten steps in schedule order with absolute millisecond offsets
		for (const {startFrame, anim} of scheduleWithOffsets) {
			let timeCursor = startFrame
			for (const st of (anim.steps || [])) {
				const stepStart = resolveStepStartFrame(st as any, startFrame)
				if (st.type === 'tween') {
					const durationMs = Math.max(1, Math.round((st.duration as number) * 1000))
					const easing = (st.easing as any) || 'linear'
					const props = (st.properties || {}) as Record<string, {from?: any; to: any}>
					const animObj: any = {targets: target, duration: durationMs, easing}
					for (const key of Object.keys(props)) {
						const p = props[key]
						animObj[key] = {value: p.to, ...(p.from != null ? {from: p.from} : {})}
					}
					const when = Math.round(stepStart * (1000 / fps))
					const {targets, ...params} = animObj
					tl.add(target, params, when)
					timeCursor = Math.max(timeCursor, stepStart + Math.round((st.duration as number) * fps))
				} else if ((st as any).type === 'anime') {
					const when = Math.round(stepStart * (1000 / fps))
					const raw = (st as any).props || {}
					const props: any = normalizeAnimeProps({...raw})
					if (props.stagger != null) {
						const s = props.stagger
						if (typeof s === 'number') props.stagger = animeStagger(s)
						else if (typeof s === 'object') props.stagger = animeStagger(s.each ?? 50, {start: s.start ?? 0})
					}
					const explicitDuration = (st as any).duration as number | undefined
					// add to timeline (animates the target object)
					tl.add(target, props, when)
					if (explicitDuration != null) {
						timeCursor = Math.max(timeCursor, stepStart + Math.round(explicitDuration * fps))
					} else {
						const ms = computeAnimePropsDurationMs(props)
						if (ms > 0) timeCursor = Math.max(timeCursor, stepStart + Math.round((ms / 1000) * fps))
					}
				} else {
					const dur = (st as any).duration as number | undefined
					if (dur && dur > 0) timeCursor = Math.max(timeCursor, stepStart + Math.round(dur * fps))
				}
			}
		}
		return {tl, target}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(scheduleWithOffsets)])

	// Seek timeline for current frame
	React.useMemo(() => {
		try {
			(animeState.tl as any).seek((frame * 1000) / fps)
		} catch {}
		return undefined
	}, [animeState, frame, fps])

	// Custom followPath motion
	// Added: If 'followPathProgress' is animated (tween or anime), use it to drive motion along a path
	const computeFollowPathByProgress = (): {x: number; y: number; angle?: number} | null => {
		// Read progress from tweens (Remotion easing) first, then anime
		const progressFromTween = computeAnimatedFromSchedule(scheduleWithOffsets, 'followPathProgress', frame, fps, undefined)
		const progressFromAnime = animeState.target['followPathProgress'] as number | undefined
		const progress = (progressFromTween != null ? progressFromTween : progressFromAnime)
		if (progress == null) return null
		const clamp = (v: number) => Math.max(0, Math.min(1, v))
		const tt = clamp(progress)
		// Resolve options (prefer anime overrides)
		const overridePathId = animeState.target['followPath.pathId'] as string | undefined
		const overrideSmooth = animeState.target['followPath.smooth'] as boolean | undefined
		const overrideTension = animeState.target['followPath.tension'] as number | undefined
		const overrideClosed = animeState.target['followPath.closed'] as boolean | undefined
		const overrideCoord = animeState.target['followPath.coordSpace'] as string | undefined
		const overrideOrient = animeState.target['followPath.orient'] as boolean | undefined

		// Try to inherit params from a custom step if present to avoid duplicating YAML
		let params: any = {}
		for (const s of scheduleWithOffsets) {
			const steps = (s.anim?.steps || []) as any[]
			const fp = steps.find((st) => st && st.type === 'custom' && String(st.name || '').toLowerCase() === 'followpath')
			if (fp) { params = fp.params || {}; break }
		}
		// Points source: inline points take priority, else pathId registry
		let pts: Array<{x: number; y: number}> = []
		if (Array.isArray(params?.points)) {
			pts = params.points.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : {x: p.x, y: p.y})
		}
		const pathId = overridePathId ?? (typeof params?.pathId === 'string' ? String(params.pathId) : undefined)
		if ((!pts || pts.length < 2) && pathId) {
			const info = pathRegistry?.get(pathId)
			if (info?.points && info.points.length > 1) pts = info.points
			// inherit defaults from the path when not overridden
			if (overrideTension == null && typeof info?.tension === 'number') params.tension = info.tension
			if (overrideSmooth == null && typeof info?.smooth === 'boolean') params.smooth = info.smooth
			if (overrideClosed == null && typeof info?.closed === 'boolean') params.closed = info.closed
			if (overrideCoord == null && (info?.coordSpace === 'local' || info?.coordSpace === 'root')) params.coordSpace = info.coordSpace
		}
		if (!pts || pts.length < 2) return {x: 0, y: 0}
		const closed = typeof overrideClosed === 'boolean' ? overrideClosed : Boolean(params?.closed)
		const tParam = typeof overrideTension === 'number' ? overrideTension : (typeof params?.tension === 'number' ? params.tension : 0)
		const smooth = typeof overrideSmooth === 'boolean' ? overrideSmooth : Boolean(params?.smooth)
		if (smooth) {
			const subdiv = Math.max(2, Math.floor(Number((params as any)?.subdiv ?? 100)))
			const s = (1 - Math.max(0, Math.min(1, tParam))) / 2
			const smoothed = sampleCatmullRom(pts, closed, subdiv, s)
			if (smoothed.length >= 2) pts = smoothed
		}
		// Coord space
		const coordSpace = (overrideCoord === 'local' || overrideCoord === 'root') ? overrideCoord : (params?.coordSpace === 'local' ? 'local' : 'root')
		let offsetX = 0, offsetY = 0
		if (coordSpace === 'local') {
			const leftNum = typeof (node as any).position?.x === 'number' ? (node as any).position?.x : 0
			const topNum = typeof (node as any).position?.y === 'number' ? (node as any).position?.y : 0
			offsetX = leftNum; offsetY = topNum
		}
		// Length table
		const lengths: number[] = [0]
		for (let i = 1; i < pts.length; i++) lengths[i] = lengths[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
		const total = lengths[lengths.length - 1] || 1
		const targetLen = tt * total
		let seg = 1
		while (seg < lengths.length && lengths[seg] < targetLen) seg++
		const prev = pts[seg - 1]
		const next = pts[seg] || prev
		const segLen = lengths[seg] - lengths[seg - 1] || 1
		const segT = (targetLen - lengths[seg - 1]) / segLen
		const x = offsetX + prev.x + (next.x - prev.x) * segT
		const y = offsetY + prev.y + (next.y - prev.y) * segT
		let angle: number | undefined
		const orient = typeof overrideOrient === 'boolean' ? overrideOrient : Boolean(params?.orient)
		if (orient) angle = Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI
		return {x, y, angle}
	}

	// Custom followPath motion (timed step)
	const computeFollowPathLocal = (): {x: number; y: number; angle?: number} | null => {
		for (const s of scheduleWithOffsets) {
			const steps = (s.anim?.steps || []) as any[]
			const fp = steps.find((st) => st && st.type === 'custom' && String(st.name || '').toLowerCase() === 'followpath')
			if (!fp) continue
			// Account for cumulative durations and delays of preceding steps within the same animation
			let precedingFrames = 0
			for (const st of steps) {
				if (st === fp) break
				const stDelay = Math.round((((st as any)?.delay ?? 0) as number) * fps)
				precedingFrames += stDelay
				const stDurSec = (st as any)?.duration as number | undefined
				if (stDurSec && stDurSec > 0) {
					precedingFrames += Math.max(1, Math.round(stDurSec * fps))
				}
			}
			const delay = Math.round(((fp.delay ?? 0) as number) * fps)
			const start = s.startFrame + precedingFrames + delay
			const dur = Math.max(1, Math.round(((fp.duration as number) || 0) * fps))
			let t = (frame - start) / dur
			if (t < 0) return null
			// Apply easing if provided on the step
			const ease = mapEasing(fp.easing as any)
			const tt = ease(Math.max(0, Math.min(1, t)))
			// Resolve points
			let pts: Array<{x: number; y: number}> = []
			if (Array.isArray(fp.params?.points)) {
				pts = fp.params.points.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : {x: p.x, y: p.y})
			} else if (typeof fp.params?.pathId === 'string') {
				const info = pathRegistry?.get(String(fp.params.pathId))
				if (info?.points && info.points.length > 1) {
					pts = info.points
					// default tension/closed/smooth/coordSpace from path if not provided
					if ((fp.params as any)?.tension == null && typeof info.tension === 'number') {
						(fp.params as any).tension = info.tension
					}
					if ((fp.params as any)?.closed == null && typeof info.closed === 'boolean') {
						(fp.params as any).closed = info.closed
					}
					if ((fp.params as any)?.smooth == null && typeof info.smooth === 'boolean') {
						(fp.params as any).smooth = info.smooth
					}
					if ((fp.params as any)?.coordSpace == null && (info.coordSpace === 'local' || info.coordSpace === 'root')) {
						(fp.params as any).coordSpace = info.coordSpace
					}
				}
			}
			if (pts.length < 2) return {x: 0, y: 0}
			// Optional smoothing for motion to match smooth drawn path
			if (fp.params?.smooth === true) {
				const subdiv = Math.max(2, Math.floor(Number((fp.params as any)?.subdiv ?? 100)))
				const tParam = Number((fp.params as any)?.tension ?? 0)
				const s = (1 - Math.max(0, Math.min(1, tParam))) / 2
				const smoothed = sampleCatmullRom(pts, Boolean(fp.params?.closed), subdiv, s)
				if (smoothed.length >= 2) pts = smoothed
			}
			// Coordinate space: if local, offset by nearest ancestor box origin (we assume element's own box)
			let offsetX = 0
			let offsetY = 0
			if (fp.params?.coordSpace === 'local') {
				// If the element has its own left/top numeric, use as offset
				const leftNum = typeof (node as any).position?.x === 'number' ? (node as any).position?.x : 0
				const topNum = typeof (node as any).position?.y === 'number' ? (node as any).position?.y : 0
				offsetX = leftNum
				offsetY = topNum
			}
			// Sample polyline with linear interpolation along cumulative length
			const lengths: number[] = [0]
			for (let i = 1; i < pts.length; i++) {
				const dx = pts[i].x - pts[i - 1].x
				const dy = pts[i].y - pts[i - 1].y
				lengths[i] = lengths[i - 1] + Math.hypot(dx, dy)
			}
			const total = lengths[lengths.length - 1] || 1
			const target = tt * total
			let seg = 1
			while (seg < lengths.length && lengths[seg] < target) seg++
			const prev = pts[seg - 1]
			const next = pts[seg] || prev
			const segLen = lengths[seg] - lengths[seg - 1] || 1
			const segT = (target - lengths[seg - 1]) / segLen
			const x = offsetX + prev.x + (next.x - prev.x) * segT
			const y = offsetY + prev.y + (next.y - prev.y) * segT
			let angle: number | undefined
			if (fp.params?.orient === true) {
				angle = Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI
			}
			return {x, y, angle}
		}
		return null
	}
	const followProg = computeFollowPathByProgress()
	const follow = followProg ?? computeFollowPathLocal()

	const rotation = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'rotation', frame, fps, 0) ?? (animeState.target['rotation'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'rotation', frame, fps, 0) ?? 0
	const opacity = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'opacity', frame, fps, (node as any).style?.opacity ?? 1) ?? (animeState.target['opacity'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'opacity', frame, fps, (node as any).style?.opacity ?? 1) ?? 1
	const scaleUniform = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'scale', frame, fps, 1) ?? (animeState.target['scale'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'scale', frame, fps, 1)
	const scaleX = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'scale.x', frame, fps, scaleUniform ?? 1) ?? (animeState.target['scale.x'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'scale.x', frame, fps, scaleUniform ?? 1) ?? (scaleUniform ?? 1)
	const scaleY = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'scale.y', frame, fps, scaleUniform ?? 1) ?? (animeState.target['scale.y'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'scale.y', frame, fps, scaleUniform ?? 1) ?? (scaleUniform ?? 1)
	const xAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'x', frame, fps, typeof (node as any).position?.x === 'number' ? (node as any).position?.x : undefined) ?? (animeState.target['x'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'x', frame, fps, typeof (node as any).position?.x === 'number' ? (node as any).position?.x : undefined)
	const yAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'y', frame, fps, typeof (node as any).position?.y === 'number' ? (node as any).position?.y : undefined) ?? (animeState.target['y'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'y', frame, fps, typeof (node as any).position?.y === 'number' ? (node as any).position?.y : undefined)
	const zAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'z', frame, fps, typeof (node as any).z === 'number' ? ((node as any).z as number) : undefined) ?? (animeState.target['z'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'z', frame, fps, typeof (node as any).z === 'number' ? ((node as any).z as number) : undefined)
	const widthAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'width', frame, fps, typeof (node as any).size?.width === 'number' ? ((node as any).size?.width as number) : undefined) ?? (animeState.target['width'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'width', frame, fps, typeof (node as any).size?.width === 'number' ? ((node as any).size?.width as number) : undefined)
	const heightAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'height', frame, fps, typeof (node as any).size?.height === 'number' ? ((node as any).size?.height as number) : undefined) ?? (animeState.target['height'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'height', frame, fps, typeof (node as any).size?.height === 'number' ? ((node as any).size?.height as number) : undefined)
	// Visual FX tweenables
	const radiusAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'radius', frame, fps, undefined) ?? (animeState.target['radius'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'radius', frame, fps, undefined)
	const radiusTLAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'radius.tl', frame, fps, undefined) ?? (animeState.target['radius.tl'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'radius.tl', frame, fps, undefined)
	const radiusTRAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'radius.tr', frame, fps, undefined) ?? (animeState.target['radius.tr'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'radius.tr', frame, fps, undefined)
	const radiusBRAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'radius.br', frame, fps, undefined) ?? (animeState.target['radius.br'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'radius.br', frame, fps, undefined)
	const radiusBLAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'radius.bl', frame, fps, undefined) ?? (animeState.target['radius.bl'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'radius.bl', frame, fps, undefined)
	const blurAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'blur', frame, fps, undefined) ?? (animeState.target['blur'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'blur', frame, fps, undefined)
	const shadowXAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'shadow.x', frame, fps, undefined) ?? (animeState.target['shadow.x'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'shadow.x', frame, fps, undefined)
	const shadowYAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'shadow.y', frame, fps, undefined) ?? (animeState.target['shadow.y'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'shadow.y', frame, fps, undefined)
	const shadowBlurAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'shadow.blur', frame, fps, undefined) ?? (animeState.target['shadow.blur'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'shadow.blur', frame, fps, undefined)
	const shadowSpreadAnim = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'shadow.spread', frame, fps, undefined) ?? (animeState.target['shadow.spread'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'shadow.spread', frame, fps, undefined)
	const strokeWidthAnimGeneric = computeAnimeNumericFromSchedule(scheduleWithOffsets, 'stroke.width', frame, fps, (node as any).style?.stroke?.width) ?? (animeState.target['stroke.width'] as number | undefined) ?? computeAnimatedFromSchedule(scheduleWithOffsets, 'stroke.width', frame, fps, (node as any).style?.stroke?.width)

	const baseStyle: CSSProperties = { opacity }
	// Positioning
	if (positioningMode === 'absolute') {
		baseStyle.position = 'absolute'
		const leftPercent = toPercentNumber((node as any).position?.x)
		const topPercent = toPercentNumber((node as any).position?.y)
		const leftPx = typeof (node as any).position?.x === 'number' ? ((node as any).position?.x as number) : undefined
		const topPx = typeof (node as any).position?.y === 'number' ? ((node as any).position?.y as number) : undefined
		if (leftPercent != null) baseStyle.left = `${leftPercent}%`
		if (topPercent != null) baseStyle.top = `${topPercent}%`
		if (leftPx != null) baseStyle.left = `${leftPx}px`
		if (topPx != null) baseStyle.top = `${topPx}px`
		// If absolute and intended full overlay (width/height 100%), default to top/left 0
		const isFullW = String((node as any).size?.width ?? '').toString() === '100%'
		const isFullH = String((node as any).size?.height ?? '').toString() === '100%'
		if ((baseStyle.left == null || baseStyle.top == null) && (isFullW || isFullH)) {
			if (baseStyle.left == null) (baseStyle as any).left = 0
			if (baseStyle.top == null) (baseStyle as any).top = 0
		}
	} else if (positioningMode === 'relative') {
		baseStyle.position = 'relative'
		baseStyle.left = toCssPercentOrPx((node as any).position?.x)
		baseStyle.top = toCssPercentOrPx((node as any).position?.y)
	}

	// If following a path, place element at parent's origin so transforms control position
	if (follow) {
		baseStyle.position = 'absolute';
		(baseStyle as any).left = 0;
		(baseStyle as any).top = 0;
		// Ensure rotation/scaling happen around center
		(baseStyle as any).transformOrigin = '50% 50%';
	}

	// Size
	if ((node as any).size?.width != null || widthAnim != null) baseStyle.width = widthAnim != null ? `${widthAnim}px` : toCssPercentOrPx((node as any).size?.width as any)
	if ((node as any).size?.height != null || heightAnim != null) baseStyle.height = heightAnim != null ? `${heightAnim}px` : toCssPercentOrPx((node as any).size?.height as any)

	// Visual styles (animated)
	const fillColorAnim = (animeState.target['fill'] as string | undefined) ?? computeAnimatedColorFromSchedule(scheduleWithOffsets, 'fill', frame, fps, (node as any).style?.fill)
	const textColorAnim = (animeState.target['color'] as string | undefined) ?? computeAnimatedColorFromSchedule(scheduleWithOffsets, 'color', frame, fps, (node as any).style?.color)
	const strokeColorAnim = (animeState.target['stroke.color'] as string | undefined) ?? computeAnimatedColorFromSchedule(scheduleWithOffsets, 'stroke.color', frame, fps, (node as any).style?.stroke?.color)
	const shadowColorAnim = (animeState.target['shadow.color'] as string | undefined) ?? computeAnimatedColorFromSchedule(scheduleWithOffsets, 'shadow.color', frame, fps, undefined)
	// Background fill (not for image container)
	if ((node as any).type !== 'image') {
		if (fillColorAnim) baseStyle.background = fillColorAnim
		else if ((node as any).style?.fill) baseStyle.background = (node as any).style.fill
	}
	// Stroke as CSS border
	const strokeWidthAnim = typeof strokeWidthAnimGeneric === 'number' ? strokeWidthAnimGeneric : (node as any).style?.stroke?.width
	const strokeColorFinal = strokeColorAnim ?? (node as any).style?.stroke?.color
	if (strokeWidthAnim && strokeColorFinal) {
		baseStyle.border = `${strokeWidthAnim}px solid ${strokeColorFinal}`
	}
	// Radius: uniform or per-corner
	const rTL = radiusTLAnim ?? radiusAnim
	const rTR = radiusTRAnim ?? radiusAnim
	const rBR = radiusBRAnim ?? radiusAnim
	const rBL = radiusBLAnim ?? radiusAnim
	if ([rTL, rTR, rBR, rBL].some((v) => typeof v === 'number')) {
		if (typeof rTL === 'number') (baseStyle as any).borderTopLeftRadius = `${Math.max(0, rTL)}px`
		if (typeof rTR === 'number') (baseStyle as any).borderTopRightRadius = `${Math.max(0, rTR)}px`
		if (typeof rBR === 'number') (baseStyle as any).borderBottomRightRadius = `${Math.max(0, rBR)}px`
		if (typeof rBL === 'number') (baseStyle as any).borderBottomLeftRadius = `${Math.max(0, rBL)}px`
	} else if (typeof radiusAnim === 'number') {
		(baseStyle as any).borderRadius = `${Math.max(0, radiusAnim)}px`
	}
	// Blur and Shadow
	const filterParts: string[] = []
	if (typeof blurAnim === 'number' && blurAnim !== 0) filterParts.push(`blur(${Math.max(0, blurAnim)}px)`)
	if (filterParts.length > 0) (baseStyle as any).filter = filterParts.join(' ')
	const sx = typeof shadowXAnim === 'number' ? shadowXAnim : 0
	const sy = typeof shadowYAnim === 'number' ? shadowYAnim : 0
	const sBlur = typeof shadowBlurAnim === 'number' ? shadowBlurAnim : 0
	const sSpread = typeof shadowSpreadAnim === 'number' ? shadowSpreadAnim : 0
	const sColor = shadowColorAnim ?? 'rgba(0,0,0,0.25)'
	if ([sx, sy, sBlur, sSpread].some((v) => typeof v === 'number' && v !== 0) || shadowColorAnim) {
		(baseStyle as any).boxShadow = `${Math.round(sx)}px ${Math.round(sy)}px ${Math.max(0, Math.round(sBlur))}px ${Math.max(0, Math.round(sSpread))}px ${sColor}`
	}
	// CSS animation steps
	const cssSteps = (node.animations || []).flatMap((a) => a.steps).filter((s: any) => s && s.type === 'css') as any[]
	if (cssSteps.length > 0) {
		(baseStyle as any).animation = cssSteps
			.map((s) => {
				const name = s.name
				const duration = `${(s.duration ?? 0)}s`
				const timing = s.timingFunction ?? 'linear'
				const delay = `${(s.delay ?? 0)}s`
				const iter = s.iterationCount ?? 1
				const direction = s.direction ?? 'normal'
				const fill = s.fillMode ?? 'forwards'
				const play = s.playState ?? 'running'
				return `${name} ${duration} ${timing} ${delay} ${iter} ${direction} ${fill} ${play}`
			})
			.join(', ')
	}

	const transformParts: string[] = []
	// followPath translation first; pre-offset by element center so its center rides the path
	if (follow) {
		transformParts.push('translate(-50%, -50%)')
		transformParts.push(`translate(${Math.round(follow.x)}px, ${Math.round(follow.y)}px)`)
		if (follow.angle != null) {
			transformParts.push(`rotate(${follow.angle}deg)`)
		}
	}
	if (positioningMode === 'absolute') {
		if (typeof (node as any).position?.x === 'string' || typeof (node as any).position?.y === 'string') {
			transformParts.push('translate(-50%, -50%)')
		}
	}
	if (xAnim != null || yAnim != null) {
		transformParts.push(`translate(${xAnim ?? 0}px, ${yAnim ?? 0}px)`)
	}
	if (rotation) transformParts.push(`rotate(${rotation}deg)`)
	if (scaleX !== 1 || scaleY !== 1) transformParts.push(`scale(${scaleX}, ${scaleY})`)
	if (zAnim != null) transformParts.push(`translateZ(${zAnim}px)`)
	if (transformParts.length > 0) baseStyle.transform = transformParts.join(' ')

	// z layering
	const explicitIndex = (node as any).index
	if (typeof explicitIndex === 'number') {
		;(baseStyle as any).zIndex = explicitIndex
	} else if (typeof (node as any).z === 'number') {
		// Fallback to z for zIndex if index not provided
		;(baseStyle as any).zIndex = (node as any).z as number
	}

	// Layout
	if ((node.layout && (node.positioning?.mode ?? 'layout') === 'layout') || node.type === 'group') {
		if (!baseStyle.display) baseStyle.display = 'flex'
		const flexDirection = node.layout?.type === 'row' ? 'row' : 'column'
		baseStyle.flexDirection = flexDirection
		const gap = getGap(node.layout?.gap)
		;(baseStyle as any).rowGap = `${gap.row}px`
		;(baseStyle as any).columnGap = `${gap.column}px`
		if (node.layout?.align) {
			baseStyle.alignItems = mapAlign(node.layout.align)
		} else {
			if (flexDirection === 'row') {
				baseStyle.alignItems = 'center'
			} else {
				baseStyle.alignItems = 'flex-start'
			}
		}
		if (node.layout?.justify) {
			baseStyle.justifyContent = mapJustify(node.layout.justify)
		} else {
			baseStyle.justifyContent = 'flex-start'
		}
		if (node.layout?.padding) baseStyle.padding = paddingArrayToCss(node.layout.padding)
		if (node.layout?.wrap) baseStyle.flexWrap = node.layout.wrap
		if (node.layout?.clip) baseStyle.overflow = 'hidden'
	}

	// Layout item
	if (node.layoutItem) {
		if (node.layoutItem.order != null) (baseStyle as any).order = node.layoutItem.order
		if (node.layoutItem.alignSelf && node.layoutItem.alignSelf !== 'auto') {
			baseStyle.alignSelf = mapAlign(node.layoutItem.alignSelf) as any
		}
		if (node.layoutItem.margin) {
			const m = node.layoutItem.margin
			baseStyle.margin = `${m?.top ?? 0}px ${m?.right ?? 0}px ${m?.bottom ?? 0}px ${m?.left ?? 0}px`
		}
	}

	const renderChildren = (children?: ElementNode[]) => {
		if (!children) return null
		// Build per-child inherited anime steps from this node's animations where props.targets === 'children'
		// Each child gets its own delay computed from props.stagger
		// We compute absolute start offsets in seconds via step.delay to preserve timeline alignment
		const scheduledForThis = scheduleAnimations((node as any).animations, fps, timeline, animRegistry)
		const childCount = children.length
		const perChildInherited: (readonly (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[])[] = Array.from({length: childCount}, () => [])
		for (const sched of scheduledForThis) {
			let timeCursor = sched.startFrame
			for (const st of (sched.anim?.steps || []) as any[]) {
				const stepDelayFrames = Math.round((((st?.delay ?? 0) as number) * fps))
				timeCursor += stepDelayFrames
				if ((st as any).type === 'anime' && st?.props && String(st.props.targets) === 'children') {
					// Compute duration frames of this anime step
					const rawProps = (st as any).props || {}
					const propsNorm: any = normalizeAnimeProps({...rawProps})
					const explicitDuration = (st as any).duration as number | undefined
					const durationMs = explicitDuration != null ? Math.max(1, Math.round(explicitDuration * 1000)) : computeAnimePropsDurationMs(propsNorm)
					// Determine per-child additional delay via props.stagger
					const staggerSpec = propsNorm.stagger
					let eachMs = 0
					let startMs = 0
					if (typeof staggerSpec === 'number') {
						eachMs = staggerSpec
					} else if (staggerSpec && typeof staggerSpec === 'object') {
						eachMs = Number(staggerSpec.each ?? 50)
						startMs = Number(staggerSpec.start ?? 0)
					}
					for (let i = 0; i < childCount; i++) {
						const childExtraMs = startMs + eachMs * i
						const whenFramesForChild = timeCursor + Math.round((childExtraMs / 1000) * fps)
						const delaySec = whenFramesForChild / fps
						const cloned: AnimeStep = {
							type: 'anime',
							// Keep explicit duration if provided for consistent scheduling, else rely on props
							...(explicitDuration != null ? {duration: explicitDuration} : {}),
							// Encode absolute start via step-level delay
							delay: delaySec,
							props: {...rawProps},
						}
						// These are for children only; do not propagate the special target to the child
						delete (cloned.props as any).targets
						perChildInherited[i] = [...perChildInherited[i], cloned]
					}
				}
				// Advance timeCursor by the duration of this step when applicable
				const durSec = (st as any)?.duration as number | undefined
				if ((st as any).type === 'tween') {
					timeCursor += Math.max(1, Math.round(((st as any).duration as number) * fps))
				} else if ((st as any).type === 'anime') {
					const rawPropsAdv = (st as any).props || {}
					const propsNormAdv: any = normalizeAnimeProps({...rawPropsAdv})
					if (durSec != null) timeCursor += Math.max(1, Math.round(durSec * fps))
					else {
						const ms = computeAnimePropsDurationMs(propsNormAdv)
						if (ms > 0) timeCursor += Math.round((ms / 1000) * fps)
					}
				} else if (durSec && durSec > 0) {
					timeCursor += Math.max(1, Math.round(durSec * fps))
				}
			}
		}
		return children.map((c, i) => (
			<ElementRenderer
				key={c.id || i}
				node={c}
				fps={fps}
				parentSize={{w: parentSize.w, h: parentSize.h}}
				offsetFrames={offsetFrames}
				inheritedSteps={[...inheritedSteps, ...perChildInherited[i]]}
				timeline={timeline}
				animRegistry={animRegistry}
				pathRegistry={pathRegistry}
			/>
		))
	}

	if ((node as any).type === 'text') {
		const style: CSSProperties = {...baseStyle}
		// Detect if anime text targets are requested (chars/words)
		const animeTextSteps = scheduleWithOffsets
			.flatMap(({startFrame, anim}) => (anim?.steps || []).map((st:any) => ({st, startFrame})))
			.filter(({st}) => st && st.type === 'anime' && st.props && typeof st.props.targets === 'string' && String(st.props.targets).startsWith('text.'))
		const needChars = animeTextSteps.some(({st}) => String(st.props.targets) === 'text.chars')
		const needWords = animeTextSteps.some(({st}) => String(st.props.targets) === 'text.words')
		const splitMode: 'none' | 'chars' | 'words' = needChars ? 'chars' : (needWords ? 'words' : 'none')
		const spanRefs = React.useRef<HTMLSpanElement[]>([])
		spanRefs.current = []
		if ((node as any).style?.font) {
			if ((node as any).style.font.family) style.fontFamily = (node as any).style.font.family
			if ((node as any).style.font.size != null) style.fontSize = `${(node as any).style.font.size}px`
			if ((node as any).style.font.weight) style.fontWeight = (node as any).style.font.weight
		}
		// Text color: prefer animated `color`, then style.color, then fill
		if (textColorAnim) style.color = textColorAnim
		else if ((node as any).style?.color) style.color = (node as any).style.color
		else if ((node as any).style?.fill) style.color = (node as any).style.fill
		let textContent = (node as any).text ?? ''
		let caret: {visible: boolean; affectsLayout?: boolean; widthPx?: number; gapPx?: number; topPx?: number; heightPx?: number; top?: string; translateY?: string} | undefined
		let partialStyle: CSSProperties | undefined
		let partialLen: number | undefined
		// Custom text animations (e.g., typewriter). Respect scheduled timing.
		const customTypewriterSteps = (node.animations || [])
			.flatMap((a) => (a.steps || []).map((st) => ({anim: a, step: st as any})))
			.filter(({step}) => step && step.type === 'custom' && String(step.name || '').toLowerCase() === 'typewriter')
		if (customTypewriterSteps.length > 0) {
			const handler = undefined as any
			if (handler) {
				// Derive start and duration from the first matching scheduled entry
				const sched = scheduleWithOffsets
					.map((s) => ({start: s.startFrame, steps: (s.anim?.steps || []) as any[]}))
					.find((entry) => entry.steps.some((st) => st && st.type === 'custom' && String(st.name || '').toLowerCase() === 'typewriter'))
				if (sched) {
					const st = sched.steps.find((x) => x.type === 'custom' && String(x.name || '').toLowerCase() === 'typewriter') as any
					const start = sched.start + Math.round(((st?.delay ?? 0) as number) * fps)
					const durFrames = Math.max(1, Math.round(((st?.duration as number) || 0) * fps))
					let raw = (frame - start) / durFrames
					const ease = mapEasing((st?.easing as any) || undefined)
					const progress = ease(Math.max(0, Math.min(1, raw)))
					const res = handler({frame, fps, durationFrames: durFrames, progress, params: st?.params, baseText: String(textContent)}) as any
					if (res?.textOverride != null) textContent = res.textOverride
					if (res?.styleOverride) Object.assign(style, res.styleOverride)
					if (res?.caret) caret = res.caret
					if (res?.styleOverridePartial && res?.revealRange) {
						partialStyle = res.styleOverridePartial
						const startIdx: number = res.revealRange.start
						const endIdx: number = res.revealRange.end
						partialLen = Math.max(0, endIdx - startIdx)
					}
				}
			}
		}

		// If a partial style is provided, wrap the last revealed segment (tail) with a span
		if (partialStyle) {
			let content: React.ReactNode = textContent
			// Determine unit by inspecting last result from handler via textContent structure
			// Prefer robust split on visible text rather than relying on absolute indices
			const visible = textContent
			const m = /(\S+)(\s*)$/.exec(visible)
			if (m) {
				// We have at least one non-space at the end
				const head = visible.slice(0, visible.length - m[0].length)
				const wordOrChar = m[1]
				const trailing = m[2] || ''
				if (wordOrChar.length > 1) {
					// Treat as word
					content = (
						<span>
							{head}
							<span style={partialStyle}>{wordOrChar}</span>
							{trailing}
						</span>
					)
				} else {
					// Single character (per-char mode)
					content = (
						<span>
							{head}
							<span style={partialStyle}>{wordOrChar}</span>
							{trailing}
						</span>
					)
				}
			}
			if (caret && caret.visible && !caret.affectsLayout) {
				const gap = Math.max(0, caret.gapPx ?? 3)
				const caretWidth = Math.max(1, caret.widthPx ?? 2)
				const styleWithVars: CSSProperties = {
					...style,
					display: 'inline-block',
					position: 'relative',
					['--tw-caret-gap' as any]: `${gap}px`,
					['--tw-caret-width' as any]: `${caretWidth}px`,
					...(caret.top ? ({['--tw-caret-top' as any]: caret.top} as any) : {}),
					...(caret.translateY ? ({['--tw-caret-translateY' as any]: caret.translateY} as any) : {}),
				}
				return (
					<div className="tw-caret" style={styleWithVars}>{content}</div>
				)
			}
			return <div style={style}>{content}</div>
		}

		if (caret && caret.visible && !caret.affectsLayout) {
			const gap = Math.max(0, caret.gapPx ?? 3)
			const caretWidth = Math.max(1, caret.widthPx ?? 2)
			const styleWithVars: CSSProperties = {
				...style,
				display: 'inline-block',
				position: 'relative',
				['--tw-caret-gap' as any]: `${gap}px`,
				['--tw-caret-width' as any]: `${caretWidth}px`,
				...(caret.heightPx != null ? ({['--tw-caret-height' as any]: `${caret.heightPx}px`} as any) : {}),
				...(caret.top ? ({['--tw-caret-top' as any]: caret.top} as any) : {}),
				...(caret.translateY ? ({['--tw-caret-translateY' as any]: caret.translateY} as any) : {}),
			}
			return (
				<div className="tw-caret" style={styleWithVars}>{textContent}</div>
			)
		}

		// Render split if requested for anime text targets
		if (splitMode !== 'none') {
			const makeCharSpans = (txt: string) => Array.from(txt).map((ch, i) => (
				<span key={i} ref={(el) => { if (el) spanRefs.current[i] = el }} style={{display: 'inline-block'}}>{ch}</span>
			))
			const makeWordSpans = (txt: string) => {
				const parts = txt.split(/(\s+)/)
				let idx = 0
				return parts.map((p, i) => {
					if (/^\s+$/.test(p)) return <span key={`s${i}`}>{p}</span>
					const el = (
						<span key={`w${i}`} ref={(r) => { if (r) spanRefs.current[idx] = r; idx++ }} style={{display: 'inline-block'}}>{p}</span>
					)
					return el
				})
			}
			const content = splitMode === 'chars' ? makeCharSpans(textContent) : makeWordSpans(textContent)
			// Build a dedicated anime timeline for these spans
			const tlRef = React.useRef<any>(null)
			const animeTextStepsKey = React.useMemo(() => JSON.stringify(animeTextSteps.map(({st, startFrame}) => ({startFrame, delay: st?.delay, props: st?.props}))), [animeTextSteps])
			React.useEffect(() => {
				if (animeTextSteps.length === 0) { tlRef.current = null; return }
				const nodes = spanRefs.current.slice()
				if (!nodes || nodes.length === 0) return
				const tl = createTimeline({autoplay: false} as any)
				for (const {st, startFrame} of animeTextSteps) {
					const when = Math.round(startFrame * (1000 / fps))
					const raw = st.props || {}
					const props: any = {...raw}
					if (props.stagger != null) {
						const s = props.stagger
						const staggerFn: any = typeof s === 'number' ? animeStagger(s) : animeStagger(s.each ?? 50, {start: s.start ?? 0})
						if (props.delay == null) props.delay = staggerFn
						else if (typeof props.delay === 'number') {
							const base = props.delay
							props.delay = (_el: any, i: number) => base + staggerFn(i)
						}
						delete props.stagger
					}
					delete props.targets
					tl.add(nodes, props, when)
				}
				tlRef.current = tl
				return () => { tlRef.current = null }
			}, [animeTextStepsKey, fps, textContent, splitMode])
			// Seek timeline deterministically
			React.useEffect(() => {
				if (tlRef.current) (tlRef.current as any).seek((frame * 1000) / fps)
			}, [frame, fps])
			return <div style={style}>{content}</div>
		}

		return <div style={style}>{textContent}</div>
	}

	if ((node as any).type === 'image') {
		const containerStyle: CSSProperties = {...baseStyle}
		const imgStyle: CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'}
		return (
			<div style={containerStyle}>
				{(node as any).src ? <img src={(node as any).src} style={imgStyle} alt={(node as any).id || ''} /> : null}
				{renderChildren((node as any).children)}
			</div>
		)
	}

	if ((node as any).type === 'circle') {
		const style: CSSProperties = {...baseStyle}
		if ((style as any).borderRadius == null) (style as any).borderRadius = 99999
		return (
			<div style={style}>
				{renderChildren((node as any).children)}
			</div>
		)
	}

	if ((node as any).type === 'path') {
		const style: CSSProperties = {...baseStyle}
		const strokeBase = (node as any).style?.stroke?.color || (node as any).style?.color || '#fff'
		const stroke = computeAnimatedColorFromSchedule(scheduleWithOffsets, 'stroke.color', frame, fps, strokeBase) || strokeBase
		const strokeWidth = (node as any).style?.stroke?.width ?? 2
		const fillBase = (node as any).style?.fill ? (node as any).style?.fill : 'none'
		const fill = computeAnimatedColorFromSchedule(scheduleWithOffsets, 'fill', frame, fps, fillBase) || fillBase
		// Animated dashoffset (draw effect)
		const initialDashOffsetRaw = (node as any).style?.stroke?.dashoffset as number | undefined
		const dashArrayRaw = (node as any).style?.stroke?.dasharray as number | number[] | undefined
		// Build path d, with optional morph step
		let d = (node as any).d as string | undefined
		let pointsSource: {x: number; y: number}[] | undefined
		let closed = Boolean((node as any).closed)
		let tension = typeof (node as any).tension === 'number' ? (node as any).tension : 0
		// detect morphPath custom step
		const scheduledForThis = scheduleAnimations((node as any).animations, fps, timeline, animRegistry)
		for (const s of scheduledForThis) {
			const steps = (s.anim?.steps || []) as any[]
			const mp = steps.find((st) => st && st.type === 'custom' && String(st.name || '').toLowerCase() === 'morphpath')
			if (!mp) continue
			// Account for cumulative durations and delays of preceding steps within the same animation
			let precedingFrames = 0
			for (const st of steps) {
				if (st === mp) break
				const stDelay = Math.round((((st as any)?.delay ?? 0) as number) * fps)
				precedingFrames += stDelay
				const stDurSec = (st as any)?.duration as number | undefined
				if (stDurSec && stDurSec > 0) {
					precedingFrames += Math.max(1, Math.round(stDurSec * fps))
				}
			}
			const delay = Math.round(((mp.delay ?? 0) as number) * fps)
			const start = s.startFrame + precedingFrames + delay
			const dur = Math.max(1, Math.round(((mp.duration as number) || 0) * fps))
			let t = (frame - start) / dur
			if (t < 0) { continue }
			const ease = mapEasing(mp.easing as any)
			const tt = ease(Math.max(0, Math.min(1, t)))
			const fromPts = Array.isArray((node as any).points) ? ((node as any).points as any[]).map((p: any) => ({x: p.x, y: p.y})) : []
			const toPtsRaw = (mp.params as any)?.toPoints
			if (Array.isArray(fromPts) && Array.isArray(toPtsRaw)) {
				const toPts = toPtsRaw.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : {x: p.x, y: p.y})
				const n = Math.min(fromPts.length, toPts.length)
				const blended: {x: number; y: number}[] = []
				for (let i = 0; i < n; i++) {
					const a = fromPts[i]
					const b = toPts[i]
					blended.push({x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt})
				}
				pointsSource = blended
				if (typeof (mp.params as any)?.tension === 'number') tension = Number((mp.params as any).tension)
				if (typeof (mp.params as any)?.closed === 'boolean') closed = Boolean((mp.params as any).closed)
				break
			}
		}
		let approxLen: number | undefined
		if (!d && Array.isArray((node as any).points) && ((node as any).points as any[]).length > 0) {
			const pts = (pointsSource ?? ((node as any).points as any[]).map((p: any) => ({x: p.x, y: p.y})))
			if ((node as any).smooth) {
				d = buildBezierPathFromPoints(pts, closed, tension)
				// approximate length by sampling the same smoothing
				const sm = sampleCatmullRom(pts, closed, 120, (1 - Math.max(0, Math.min(1, tension))) / 2)
				let L = 0
				for (let i = 1; i < sm.length; i++) {
					const dx = sm[i].x - sm[i - 1].x
					const dy = sm[i].y - sm[i - 1].y
					L += Math.hypot(dx, dy)
				}
				approxLen = L
			} else {
				d = 'M ' + pts.map((p, idx) => `${idx === 0 ? '' : 'L '}${p.x} ${p.y}`).join(' ')
				if (closed) d += ' Z'
				let L = 0
				for (let i = 1; i < pts.length; i++) {
					const dx = pts[i].x - pts[i - 1].x
					const dy = pts[i].y - pts[i - 1].y
					L += Math.hypot(dx, dy)
				}
				approxLen = L
			}
		}
		const dashoffsetInitial = (() => {
			if (typeof initialDashOffsetRaw === 'number') return initialDashOffsetRaw
			if (dashArrayRaw == null && typeof approxLen === 'number') return approxLen
			if (typeof dashArrayRaw === 'number') return dashArrayRaw
			if (Array.isArray(dashArrayRaw)) return dashArrayRaw.reduce((a,b)=>a+Number(b||0),0)
			return undefined
		})()
		// Determine a numeric base for percent-based dashoffset tweens
		const dashPercentBase = (() => {
			if (typeof approxLen === 'number' && approxLen > 0) return approxLen
			if (typeof dashArrayRaw === 'number') return dashArrayRaw
			if (Array.isArray(dashArrayRaw)) return dashArrayRaw.reduce((a,b)=>a+Number(b||0),0)
			return undefined
		})()
		const dashOffsetFromTween = computeAnimatedFromSchedulePercentAware
			? computeAnimatedFromSchedulePercentAware(scheduleWithOffsets, 'dashoffset', frame, fps, dashoffsetInitial, dashPercentBase)
			: computeAnimatedFromSchedule(scheduleWithOffsets, 'dashoffset', frame, fps, dashoffsetInitial)
		const dashOffsetFromAnimeRaw = animeState.target['dashoffset'] as number | string | undefined
		const toAbsDash = (v: number | string | undefined): number | undefined => {
			if (v == null) return undefined
			if (typeof v === 'number') return v
			const m = /^(-?\d+(?:\.\d+)?)%$/.exec(String(v))
			if (m && dashPercentBase != null) return (parseFloat(m[1]) / 100) * dashPercentBase
			const n = Number.parseFloat(String(v))
			return Number.isFinite(n) ? n : undefined
		}
		const dashOffsetAnim = ((): number | undefined => {
			const animeAbs = toAbsDash(dashOffsetFromAnimeRaw)
			return animeAbs != null ? animeAbs : dashOffsetFromTween
		})()

		// Compute effective dasharray using approx length when raw not provided or far off
		const dashArrayEffectiveStr = (() => {
			const L = approxLen
			if (Array.isArray(dashArrayRaw)) return dashArrayRaw.join(' ')
			const rawNum = typeof dashArrayRaw === 'number' ? dashArrayRaw : undefined
			if (L != null) {
				const chosen = rawNum != null && L > 0 && Math.abs(rawNum - L) / L <= 0.05 ? rawNum : L
				return String(chosen)
			}
			return rawNum != null ? String(rawNum) : undefined
		})()
		const viewW = (node as any).coordSpace === 'local' && typeof (node as any).size?.width === 'number' ? (node as any).size.width : parentSize.w
		const viewH = (node as any).coordSpace === 'local' && typeof (node as any).size?.height === 'number' ? (node as any).size.height : parentSize.h
		return (
			<div style={style}>
				<svg width="100%" height="100%" viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="none">
					{d ? (
						<path
							d={d}
							stroke={stroke}
							strokeWidth={strokeWidth}
							fill={fill}
							strokeDasharray={dashArrayEffectiveStr}
							strokeDashoffset={dashOffsetAnim != null ? dashOffsetAnim : (typeof dashoffsetInitial === 'number' ? dashoffsetInitial : undefined)}
						/>
					) : null}
				</svg>
				{renderChildren((node as any).children)}
			</div>
		)
	}

	const style: CSSProperties = {...baseStyle}
	return (
		<div style={style}>
			{renderChildren((node as any).children)}
		</div>
	)
}

const CameraWrapper: React.FC<{scene: Scene; fps: number; size: {w: number; h: number}; children: React.ReactNode; enable3D?: boolean; animRegistry?: AnimRegistry}> = ({scene, fps, size, children, enable3D = true, animRegistry}) => {
	const frame = useCurrentFrame()
	const camSched = scheduleAnimations(scene.camera?.animations, fps, scene.timeline, animRegistry)

	// Anime.js camera timeline (supports type: 'anime' on camera)
	const animeCam = React.useMemo(() => {
		const target: Record<string, any> = {
			x: scene.camera?.initial?.x ?? 0,
			y: scene.camera?.initial?.y ?? 0,
			z: scene.camera?.initial?.z ?? 0,
			scale: scene.camera?.initial?.scale ?? 1,
			rotation: scene.camera?.initial?.rotation ?? 0,
		}
		const tl = createTimeline({autoplay: false} as any)
		for (const {startFrame, anim} of camSched) {
			let timeCursor = startFrame
			for (const st of (anim.steps || []) as any[]) {
				const stDelayFrames = Math.round((((st?.delay ?? 0) as number) * fps))
				timeCursor += stDelayFrames
				if ((st as any).type === 'anime') {
					const when = Math.round(timeCursor * (1000 / fps))
					const raw = (st as any).props || {}
					const props: any = normalizeAnimeProps({...raw})
					if (props.stagger != null) {
						const s = props.stagger
						if (typeof s === 'number') props.stagger = animeStagger(s)
						else if (typeof s === 'object') props.stagger = animeStagger(s.each ?? 50, {start: s.start ?? 0})
					}
					// targets field not used for camera
					delete props.targets
					tl.add(target, props, when)
					const d = (st as any).duration as number | undefined
					if (d != null) {
						timeCursor += Math.round(d * fps)
					} else {
						const ms = computeAnimePropsDurationMs(props)
						if (ms > 0) timeCursor += Math.round((ms / 1000) * fps)
					}
				} else {
					const dur = (st as any).duration as number | undefined
					if (dur && dur > 0) timeCursor += Math.round(dur * fps)
				}
			}
		}
		return {tl, target}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(camSched), fps, scene.camera?.initial?.x, scene.camera?.initial?.y, scene.camera?.initial?.scale, scene.camera?.initial?.rotation])

	React.useEffect(() => {
		if (animeCam?.tl) (animeCam.tl as any).seek((frame * 1000) / fps)
	}, [animeCam, frame, fps])

	const x = (animeCam?.target?.x as number | undefined) ?? (computeAnimatedFromSchedule(camSched, 'x', frame, fps, scene.camera?.initial?.x ?? 0) ?? 0)
	const y = (animeCam?.target?.y as number | undefined) ?? (computeAnimatedFromSchedule(camSched, 'y', frame, fps, scene.camera?.initial?.y ?? 0) ?? 0)
	const z = (animeCam?.target?.z as number | undefined) ?? (computeAnimatedFromSchedule(camSched, 'z', frame, fps, 0) ?? 0)
	const scale = (animeCam?.target?.scale as number | undefined) ?? (computeAnimatedFromSchedule(camSched, 'scale', frame, fps, scene.camera?.initial?.scale ?? 1) ?? 1)
	const rotation = (animeCam?.target?.rotation as number | undefined) ?? (computeAnimatedFromSchedule(camSched, 'rotation', frame, fps, scene.camera?.initial?.rotation ?? 0) ?? 0)
	const perspectivePx = scene.perspective ?? 800
	const style: CSSProperties = {
		width: `${size.w}px`,
		height: `${size.h}px`,
		overflow: 'hidden',
		background: scene.background ?? 'transparent',
		position: 'relative',
		perspective: `${perspectivePx}px`, perspectiveOrigin: '50% 50%'
	}
	const innerStyle: CSSProperties = {
		width: '100%',
		height: '100%',
		transform: `translate(${x}px, ${y}px) ${z ? `translateZ(${z}px) ` : ''}scale(${scale}) rotate(${rotation}deg)`,
		transformOrigin: 'center center',
		transformStyle: 'preserve-3d',
	}
	return (
		<div style={style}>
			<div style={innerStyle}>{children}</div>
		</div>
	)
}

export const parseYaml = (text: string): Scene => {
	const raw = YAML.parse(text) as any
	const scene: any = raw.scene ?? (raw.scenes && raw.scenes[0])
	if (!scene) throw new Error('No scene found in YAML')

	// Normalize shorthand-friendly schema into the strict Scene shape
	const normalizeElement = (el: any): ElementNode => {
		const base: any = {
			id: el.id,
			name: el.name,
			type: el.type,
			visible: el.visible,
			locked: el.locked,
		}

		// Positioning
		if (el.abs === true) {
			base.positioning = {mode: 'absolute'}
		} else if (el.rel === true) {
			base.positioning = {mode: 'relative'}
		} else if (el.positioning) {
			base.positioning = el.positioning
		}
		if (el.x != null || el.y != null || el.position) {
			base.position = el.position ?? {x: el.x, y: el.y}
		}

		// z and index
		if (el.z != null) base.z = el.z
		if (el.index != null) base.index = el.index

		// Position shortcuts
		if (el.center === true) {
			base.positioning = {mode: 'absolute'}
			base.position = {x: '50%', y: '50%'}
		} else if (el.topLeft === true) {
			base.positioning = {mode: 'absolute'}
			base.position = {x: 0, y: 0}
		} else if (el.topRight === true) {
			base.positioning = {mode: 'absolute'}
			base.position = {x: '100%', y: 0}
		} else if (el.bottomLeft === true) {
			base.positioning = {mode: 'absolute'}
			base.position = {x: 0, y: '100%'}
		} else if (el.bottomRight === true) {
			base.positioning = {mode: 'absolute'}
			base.position = {x: '100%', y: '100%'}
		}

		// Size
		if (el.size || el.w != null || el.h != null) {
			base.size = el.size ?? {width: el.w, height: el.h, unit: 'px'}
		}
		if (el.square != null) {
			const sq = typeof el.square === 'number' ? el.square : 100
			base.size = {width: sq, height: sq, unit: 'px'}
		} else if (el.fullWidth === true) {
			base.size = base.size ?? {}
			base.size.width = '100%'
		} else if (el.fullHeight === true) {
			base.size = base.size ?? {}
			base.size.height = '100%'
		} else if (el.full === true) {
			base.size = {width: '100%', height: '100%', unit: 'percent'}
		}

		// Layout
		if (el.layout) base.layout = el.layout
		if (el.row || el.column) {
			base.layout = base.layout ?? {}
			base.layout.type = el.row ? 'row' : 'column'
		}
		if (el.gap != null) {
			base.layout = base.layout ?? {}
			base.layout.gap = el.gap
		}
		if (el.padding != null || el.p != null) {
			base.layout = base.layout ?? {}
			base.layout.padding = el.padding ?? el.p
		}
		if (el.align) {
			base.layout = base.layout ?? {}
			base.layout.align = el.align
		}
		if (el.justify) {
			base.layout = base.layout ?? {}
			base.layout.justify = el.justify
		}

		// Layout shortcuts
		if (el.flex === true) {
			base.layout = base.layout ?? {}
			base.layout.type = 'row'
		} else if (el.flexCol === true) {
			base.layout = base.layout ?? {}
			base.layout.type = 'column'
		}
		if (el.centerItems === true) {
			base.layout = base.layout ?? {}
			base.layout.align = 'center'
			base.layout.justify = 'center'
		} else if (el.spaceBetween === true) {
			base.layout = base.layout ?? {}
			base.layout.justify = 'space-between'
		} else if (el.spaceAround === true) {
			base.layout = base.layout ?? {}
			base.layout.justify = 'space-around'
		}
		if (el.alignStart === true) {
			base.layout = base.layout ?? {}
			base.layout.align = 'start'
		} else if (el.alignCenter === true) {
			base.layout = base.layout ?? {}
			base.layout.align = 'center'
		} else if (el.alignEnd === true) {
			base.layout = base.layout ?? {}
			base.layout.align = 'end'
		} else if (el.alignBaseline === true) {
			base.layout = base.layout ?? {}
			base.layout.align = 'baseline'
		}
		if (el.justifyStart === true) {
			base.layout = base.layout ?? {}
			base.layout.justify = 'start'
		} else if (el.justifyCenter === true) {
			base.layout = base.layout ?? {}
			base.layout.justify = 'center'
		} else if (el.justifyEnd === true) {
			base.layout = base.layout ?? {}
			base.layout.justify = 'end'
		}

		// Style
		if (el.style || el.bg != null || el.color != null || el.fs != null || el.ff != null || el.fw != null || el.opacity != null || el.border != null || el.stroke != null) {
			base.style = el.style ?? {}
			if (el.bg != null) base.style.fill = el.bg
			if (el.color != null) base.style.color = el.color
			if (el.opacity != null) base.style.opacity = el.opacity
			base.style.font = base.style.font ?? {}
			if (el.fs != null) base.style.font.size = el.fs
			if (el.ff != null) base.style.font.family = el.ff
			if (el.fw != null) base.style.font.weight = el.fw
			if (el.stroke != null) {
				if (typeof el.stroke === 'string') {
					base.style.stroke = {color: el.stroke, width: 1}
				} else if (typeof el.stroke === 'object') {
					base.style.stroke = el.stroke
				}
			}
			if (el.border != null) {
				if (typeof el.border === 'string') {
					base.style.stroke = {color: el.border, width: 1}
				} else if (typeof el.border === 'object') {
					base.style.stroke = el.border
				}
			}
		}

		// Text / Image shorthands
		if (el.text != null || el.txt != null) base.text = el.text ?? el.txt
		if (el.src != null) base.src = el.src

		// Path data
		if (el.type === 'path') {
			if (Array.isArray(el.points)) {
				base.points = el.points.map((p: any) => Array.isArray(p) ? {x: p[0], y: p[1]} : {x: p.x, y: p.y})
			}
			if (typeof el.d === 'string') base.d = el.d
			if (el.closed != null) base.closed = !!el.closed
			if (el.smooth != null) base.smooth = !!el.smooth
			if (typeof el.tension === 'number') base.tension = el.tension
			if (el.coordSpace === 'local' || el.coordSpace === 'root') base.coordSpace = el.coordSpace
		}

		// Animations normalization and shortcuts
		const normalizeAnimations = (raw: any): Animation[] | undefined => {
			if (!raw) return undefined
			if (!Array.isArray(raw)) return undefined
			const result: Animation[] = []
			for (const entry of raw) {
				if (!entry) continue
				if (Array.isArray(entry)) {
					result.push({steps: entry} as Animation)
				} else if (entry.steps && Array.isArray(entry.steps)) {
					result.push(entry as Animation)
				} else if (entry.type) {
					result.push({steps: [entry]} as Animation)
				}
			}
			return result
		}

		// Animation shortcuts
		const addAnimationShortcuts = () => {
			const shortcuts: Animation[] = []
			if (el.fadeIn != null) {
				const config = typeof el.fadeIn === 'number' ? {duration: el.fadeIn} : el.fadeIn
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: {opacity: {from: 0, to: 1}} }]
				})
			}
			if (el.slideUp != null) {
				const config = typeof el.slideUp === 'number' ? {distance: el.slideUp} : el.slideUp
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: { y: {from: config.distance || 20, to: 0}, opacity: {from: 0, to: 1} } }]
				})
			}
			if (el.slideDown != null) {
				const config = typeof el.slideDown === 'number' ? {distance: el.slideDown} : el.slideDown
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: { y: {from: -(config.distance || 20), to: 0}, opacity: {from: 0, to: 1} } }]
				})
			}
			if (el.slideLeft != null) {
				const config = typeof el.slideLeft === 'number' ? {distance: el.slideLeft} : el.slideLeft
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: { x: {from: config.distance || 20, to: 0}, opacity: {from: 0, to: 1} } }]
				})
			}
			if (el.slideRight != null) {
				const config = typeof el.slideRight === 'number' ? {distance: el.slideRight} : el.slideRight
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: { x: {from: -(config.distance || 20), to: 0}, opacity: {from: 0, to: 1} } }]
				})
			}
			if (el.scaleIn != null) {
				const config = typeof el.scaleIn === 'number' ? {scale: el.scaleIn} : el.scaleIn
				shortcuts.push({
					steps: [{ type: 'tween', duration: config.duration || 0.5, delay: config.delay || 0, easing: config.easing || 'easeOut', properties: { scale: {from: config.scale || 0.8, to: 1}, opacity: {from: 0, to: 1} } }]
				})
			}
			if (el.pulse != null) {
				const config = typeof el.pulse === 'boolean' ? {} : el.pulse
				shortcuts.push({
					steps: [
						{ type: 'tween', duration: config.duration || 0.6, delay: config.delay || 0, easing: 'easeInOut', properties: { scale: {from: 1, to: config.scale || 1.05} } },
						{ type: 'tween', duration: config.duration || 0.6, easing: 'easeInOut', properties: { scale: {from: config.scale || 1.05, to: 1} } }
					]
				})
			}
			return shortcuts
		}

		const existingAnimations = el.animations ? normalizeAnimations(el.animations) : []
		const shortcutAnimations = addAnimationShortcuts()
		if (existingAnimations || shortcutAnimations.length > 0) {
			base.animations = [...(existingAnimations || []), ...shortcutAnimations]
		}



		// Children
		if (el.children) base.children = el.children.map((c: any) => normalizeElement(c))

		return base as ElementNode
	}

	const normalized: Scene = {
		id: scene.id,
		name: scene.name,
		background: scene.background,
		width: scene.width,
		height: scene.height,
		fps: scene.fps,
		duration: scene.duration,
		perspective: scene.perspective,
		timeline: scene.timeline,
		camera: (() => {
			if (!scene.camera) return scene.camera
			const cam = {...scene.camera}
			if (cam.animations && Array.isArray(cam.animations)) {
				const out: Animation[] = []
				for (const a of cam.animations as any[]) {
					if (!a) continue
					if (Array.isArray(a)) out.push({steps: a} as Animation)
					else if ((a as any).steps) out.push(a as Animation)
					else if ((a as any).type) out.push({steps: [a as any]} as Animation)
				}
				cam.animations = out
			}
			return cam
		})(),
		elements: Array.isArray(scene.elements) ? scene.elements.map((e: any) => normalizeElement(e)) : [],
	}

	return normalized
}

export const buildComponentFromScene = (scene: Scene): React.FC<{fps?: number; enable3D?: boolean}> => {
	const Comp: React.FC<{fps?: number; enable3D?: boolean}> = ({fps = 60}) => {
		const size = useMemo(() => {
			const rootContainer = scene.elements?.[0]
			const w = (typeof rootContainer?.size?.width === 'number' ? (rootContainer?.size?.width as number) : 1280) || 1280
			const h = (typeof rootContainer?.size?.height === 'number' ? (rootContainer?.size?.height as number) : 720) || 720
			return {w, h}
		}, [scene])
		const animRegistry = useMemo(() => collectAnimationRegistry(scene), [scene])

		// Dev warning: Multiple full-size flow siblings can stack unexpectedly.
		useMemo(() => {
			const isFullFlow = (n: any): boolean => {
				const w = n?.size?.width, h = n?.size?.height
				const mode = n?.positioning?.mode ?? 'layout'
				return mode !== 'absolute' && (w === '100%' && h === '100%')
			}
			const walk = (nodes?: any[]) => {
				if (!nodes) return
				let fullCount = 0
				for (const n of nodes) if (isFullFlow(n)) fullCount++
				if (fullCount > 1 && typeof console !== 'undefined') {
					console.warn('[aivideo] Detected', fullCount, 'full-size flow siblings in one container. Prefer one flow root and make additional full elements abs overlays (abs: true).')
				}
				for (const n of nodes) walk(n?.children)
			}
			walk(scene.elements as any)
			return undefined
		}, [scene])
		const pathRegistry: PathRegistry = useMemo(() => {
			const reg: PathRegistry = new Map()
			const walk = (nodes?: ElementNode[]) => {
				if (!nodes) return
				for (const n of nodes) {
					if ((n as any).type === 'path') {
						const id = (n as any).id || String(reg.size)
						const pts = Array.isArray((n as any).points) ? ((n as any).points as any[]).map((p:any)=>({x:p.x,y:p.y})) : undefined
						reg.set(id, {points: pts, closed: (n as any).closed, tension: (n as any).tension, smooth: (n as any).smooth, coordSpace: (n as any).coordSpace})
					}
					walk((n as any).children)
				}
			}
			walk(scene.elements)
			return reg
		}, [scene])

		return (
			<CameraWrapper scene={scene} fps={fps} size={size} animRegistry={animRegistry}>
				<div style={{position: 'absolute', inset: 0}}>
					{scene.elements?.map((el, i) => (
						<ElementRenderer key={el.id || i} node={el} fps={fps} parentSize={{w: size.w, h: size.h}} inheritedSteps={[]}  timeline={scene.timeline} animRegistry={animRegistry} pathRegistry={pathRegistry} />
					))}
				</div>
			</CameraWrapper>
		)
	}
	return Comp
}

export const buildComponentFromYaml = (yamlText: string): {component: React.FC; width: number; height: number; durationInFrames: number; fps: number} => {
	const scene = parseYaml(yamlText)
	const fps = scene.fps ?? 60
	const durationInFrames = scene.duration ? Math.round(scene.duration * fps) : computeMaxDurationFrames(scene, fps)
	const rootContainer = scene.elements?.[0]
	const width = scene.width ?? ((typeof rootContainer?.size?.width === 'number' ? (rootContainer?.size?.width as number) : 1280) || 1280)
	const height = scene.height ?? ((typeof rootContainer?.size?.height === 'number' ? (rootContainer?.size?.height as number) : 720) || 720)
	const component = buildComponentFromScene(scene) as React.FC
	return {component, width, height, durationInFrames, fps}
}



// ---------------------------------------------
// Reverse syntax exporter (introspective)
// 
// IMPORTANT: This exporter automatically detects supported YAML syntax
// by scanning the parser code. When you modify the parser (add/remove/update
// element props, shortcuts, animation types, etc.), the exporter will
// automatically reflect those changes without manual updates.
// 
// The exporter scans:
// - parseYaml() function for element-level keys (el.*)
// - ElementRenderer for element types and tweenable properties
// - CameraWrapper for camera initial properties
// - mapAlign/mapJustify/mapEasing for enum values
// - Animation shortcut definitions for metadata
// 
// To update docs: just call exportParserSyntax() after parser changes.
// ---------------------------------------------

type ParserSyntax = {
	topLevelKeys: string[]
	sceneProps: string[]
	cameraInitialProps: string[]
	elementTypes: string[]
	scenePropTypes: Record<string, string>
	cameraInitialPropTypes: Record<string, string>
	elementPropsMerged: Record<string, {type: string; enumValues?: string[]; isPropertyShortcut?: boolean; shortcutOf?: string; isAnimationShortcut?: boolean; affects?: string[]; signature?: string}>
	enums: {
		align: string[]
		justify: string[]
		easing: string[]
		layoutType: string[]
		positionUnit: string[]
		sizeUnit: string[]
		elementTypes: string[]
	}
	animation: {
		stepTypes: string[]
		commonFields: string[]
		tweenProperties: string[]
		tweenValueType: string
		easingValues: string[]
		shortcuts: string[]
	}
}

const uniqueSorted = (arr: string[]) => Array.from(new Set(arr)).sort()

const extractRegex = (source: string, regex: RegExp): string[] => {
	const out: string[] = []
	let m: RegExpExecArray | null
	while ((m = regex.exec(source))) {
		out.push(m[1])
	}
	return out
}

const safeFunctionSource = (fn: Function | undefined): string => {
	if (!fn) return ''
	try {
		return fn.toString()
	} catch {
		return ''
	}
}

/**
 * Computes a structured description of all YAML props supported by the parser
 * by scanning this module's function sources. This avoids manual docs updates
 * as long as identifiers are not minified away in the build that runs this.
 */
export const computeParserSyntax = (): ParserSyntax => {
	const parseSrc = safeFunctionSource(parseYaml)
	const elementRendererSrc = safeFunctionSource(ElementRenderer)
	const cameraWrapperSrc = safeFunctionSource(CameraWrapper)
	const computeAnimatedSrc = safeFunctionSource(computeAnimated as unknown as Function)
	const mapAlignSrc = safeFunctionSource(mapAlign as unknown as Function)
	const mapJustifySrc = safeFunctionSource(mapJustify as unknown as Function)
	const mapEasingSrc = safeFunctionSource(mapEasing as unknown as Function)

	// Collect element-level keys referenced as `el.<key>` inside normalization
	const elementKeys = uniqueSorted(
		extractRegex(parseSrc, /\bel\.([A-Za-z_][A-Za-z0-9_]*)/g)
	)

	// Scene-level props referenced as `scene.<key>`
	const sceneKeys = uniqueSorted(
		extractRegex(parseSrc, /\bscene\.([A-Za-z_][A-Za-z0-9_]*)/g)
	)

	// Camera initial props referenced in CameraWrapper
	const cameraInitialProps = uniqueSorted(
		extractRegex(cameraWrapperSrc, /camera\?\.initial\?\.([A-Za-z_][A-Za-z0-9_]*)/g)
	)

	// Element types referenced in renderer (branches like node.type === 'text')
	const elementTypesFromRenderer = uniqueSorted(
		extractRegex(elementRendererSrc, /node\.type\s*===\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g)
			.concat(
				extractRegex(elementRendererSrc, /node\.type\s*===\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g)
			)
	)

	// Include 'group' if referenced as special-case in layout
	const includesGroup = /node\.type\s*===\s*['"]group['"]/.test(elementRendererSrc)
	const elementTypes = uniqueSorted([
		...elementTypesFromRenderer,
		...(includesGroup ? ['group'] : []),
	])

	// Animation tweenable property names come from calls to computeAnimated* and color variants
	const tweenProps = uniqueSorted(
		extractRegex(elementRendererSrc, /computeAnimated\([^,]+,\s*['"]([^'"]+)['"]/g)
			.concat(extractRegex(elementRendererSrc, /computeAnimatedFromSchedule\([^,]+,\s*['"]([^'"]+)['"]/g))
			.concat(extractRegex(elementRendererSrc, /computeAnimatedColorFromSchedule\([^,]+,\s*['"]([^'"]+)['"]/g))
			.concat(extractRegex(cameraWrapperSrc, /computeAnimated\([^,]+,\s*['"]([^'"]+)['"]/g))
			.concat(extractRegex(computeAnimatedSrc, /properties\["?([^"\]]+)"?\]/g))
	)

	// Animation shortcut keys are element keys that look like verbs we check on `el.*`.
	// Heuristic: keys in elementKeys that are in camelCase and not basic fields.
	const basicElementFields = new Set(['id','name','type','visible','locked','positioning','position','x','y','size','w','h','layout','style','text','txt','src','animations','children','abs','rel','row','column','gap','padding','p','align','justify','wrap','clip','square','fullWidth','fullHeight','full','flex','flexCol','centerItems','spaceBetween','spaceAround','alignStart','alignCenter','alignEnd','alignBaseline','justifyStart','justifyCenter','justifyEnd','bg','color','fs','ff','fw','opacity','stroke','border','topLeft','topRight','bottomLeft','bottomRight','center'])
	const animationShortcutKeys = uniqueSorted(
		elementKeys.filter((k) => !basicElementFields.has(k))
	)

	// Property shortcuts: which shorthand keys expand to which full properties
	const propertyShortcuts: Record<string, string> = {
		// Font shorthands
		ff: 'font.family',
		fs: 'font.size', 
		fw: 'font.weight',
		// Background/color shorthands
		bg: 'style.fill',
		color: 'style.color',
		// Size shorthands
		w: 'size.width',
		h: 'size.height',
		// Position shorthands
		abs: "positioning.mode: 'absolute'",
		rel: "positioning.mode: 'relative'",
		// Text shorthand
		txt: 'text',
		// Padding shorthand
		p: 'layout.padding',
		// Position shortcuts
		center: "positioning.mode: 'absolute', position: {x: '50%', y: '50%'}",
		topLeft: "positioning.mode: 'absolute', position: {x: 0, y: 0}",
		topRight: "positioning.mode: 'absolute', position: {x: '100%', y: 0}",
		bottomLeft: "positioning.mode: 'absolute', position: {x: 0, y: '100%'}",
		bottomRight: "positioning.mode: 'absolute', position: {x: '100%', y: '100%'}",
		// Size shortcuts
		square: 'size: {width: value, height: value, unit: "px"}',
		fullWidth: 'size.width: "100%"',
		fullHeight: 'size.height: "100%"',
		full: 'size: {width: "100%", height: "100%", unit: "percent"}',
		// Layout shortcuts
		flex: "layout.type: 'row'",
		flexCol: "layout.type: 'column'",
		centerItems: "layout.align: 'center', layout.justify: 'center'",
		spaceBetween: "layout.justify: 'space-between'",
		spaceAround: "layout.justify: 'space-around'",
		alignStart: "layout.align: 'start'",
		alignCenter: "layout.align: 'center'",
		alignEnd: "layout.align: 'end'",
		alignBaseline: "layout.align: 'baseline'",
		justifyStart: "layout.justify: 'start'",
		justifyCenter: "layout.justify: 'center'",
		justifyEnd: "layout.justify: 'end'",
	}

	// Common animation fields observed in normalization and duration accounting
	const commonAnimationFields = uniqueSorted(['type','duration','delay','easing','properties'])

	// Enums derived from switch statements and usage
	const alignEnum = uniqueSorted(extractRegex(mapAlignSrc, /case\s*'([^']+)'/g))
	const justifyEnum = uniqueSorted(extractRegex(mapJustifySrc, /case\s*'([^']+)'/g))
	const easingEnum = uniqueSorted(extractRegex(mapEasingSrc, /case\s*'([^']+)'/g))

	// Type inference helpers
	const scenePropTypes: Record<string, string> = {}
	for (const k of sceneKeys) {
		if (k === 'id' || k === 'name' || k === 'background') scenePropTypes[k] = 'string'
		else if (k === 'width' || k === 'height' || k === 'fps' || k === 'duration' || k === 'perspective') scenePropTypes[k] = 'number'
		else if (k === 'camera') scenePropTypes[k] = 'Camera'
		else if (k === 'elements') scenePropTypes[k] = 'ElementNode[]'
		else scenePropTypes[k] = 'unknown'
	}

	const elementPropTypes: Record<string, string> = {}
	const setType = (key: string, type: string) => { elementPropTypes[key] = type }
	for (const k of elementKeys) {
		switch (k) {
			case 'id':
			case 'name':
				setType(k, 'string')
				break
			case 'type':
				setType(k, `enum<${elementTypes.join('|')}>`)
				break
			case 'visible':
			case 'locked':
			case 'abs':
			case 'rel':
			case 'row':
			case 'column':
			case 'flex':
			case 'flexCol':
			case 'centerItems':
			case 'spaceBetween':
			case 'spaceAround':
			case 'alignStart':
			case 'alignCenter':
			case 'alignEnd':
			case 'alignBaseline':
			case 'justifyStart':
			case 'justifyCenter':
			case 'justifyEnd':
			case 'fullWidth':
			case 'fullHeight':
			case 'full':
			case 'clip':
			case 'topLeft':
			case 'topRight':
			case 'bottomLeft':
			case 'bottomRight':
			case 'center':
				setType(k, 'boolean')
				break
			case 'x':
			case 'y':
				setType(k, 'number | percent-string')
				break
			case 'w':
			case 'h':
			case 'square':
			case 'stagger':
			case 'childrenStagger':
			case 'index':
				setType(k, 'number')
				break
			case 'positioning':
				setType(k, "{mode?: enum<layout|absolute|relative>} ")
				break
			case 'position':
				setType(k, "{x?: number|percent-string, y?: number|percent-string, unit?: enum<px|percent|canvas>} ")
				break
			case 'size':
				setType(k, "{width?: number|percent-string, height?: number|percent-string, unit?: enum<px|percent|auto>} ")
				break
			case 'layout':
				setType(k, "{type?: enum<row|column>, gap?: number | [number,number] | {row:number,column:number}, padding?: number[], align?: enum<start|center|end|stretch|baseline>, justify?: enum<start|center|end|space-between|space-around>, wrap?: enum<wrap|nowrap|wrap-reverse>, clip?: boolean}")
				break
			case 'layoutItem':
				setType(k, '{order?: number, alignSelf?: enum<auto|start|center|end|stretch>, margin?: {top?: number,right?: number,bottom?: number,left?: number}}')
				break
			case 'style':
				setType(k, '{fill?: string, color?: string, stroke?: {color?: string, width?: number}, font?: {family?: string, size?: number, weight?: enum<normal|bold>}, opacity?: number}')
				break
			case 'text':
			case 'txt':
			case 'src':
			case 'bg':
			case 'color':
			case 'ff':
				setType(k, 'string')
				break
			case 'fs':
				setType(k, 'number')
				break
			case 'fw':
				setType(k, 'enum<normal|bold>')
				break
			case 'gap':
				setType(k, 'number | [number, number] | {row:number,column:number}')
				break
			case 'padding':
			case 'p':
				setType(k, 'number[]')
				break
			case 'align':
				setType(k, `enum<${(alignEnum.length?alignEnum:['start','center','end','stretch','baseline']).join('|')}>`)
				break
			case 'justify':
				setType(k, `enum<${(justifyEnum.length?justifyEnum:['start','center','end','space-between','space-around']).join('|')}>`)
				break
			case 'wrap':
				setType(k, 'enum<wrap|nowrap|wrap-reverse>')
				break
			case 'stroke':
			case 'border':
				setType(k, 'string | {color?: string, width?: number}')
				break
			case 'opacity':
				setType(k, 'number')
				break
			case 'animations':
			case 'childrenAnimations':
			case 'groupAnimations':
				setType(k, 'Animation[]')
				break
			case 'children':
				setType(k, 'ElementNode[]')
				break
			default:
				// Shortcut keys and unknowns
				setType(k, 'unknown | shortcut')
				break
		}
	}

	const cameraInitialPropTypes: Record<string, string> = {}
	for (const k of cameraInitialProps) {
		if (k === 'x' || k === 'y' || k === 'scale' || k === 'rotation') cameraInitialPropTypes[k] = 'number'
		else cameraInitialPropTypes[k] = 'number'
	}

	// Shortcuts metadata: which base props they expand to and argument signatures
	const shortcutToProps: Record<string, string[]> = {
		fadeIn: ['opacity'],
		slideUp: ['y','opacity'],
		slideDown: ['y','opacity'],
		slideLeft: ['x','opacity'],
		slideRight: ['x','opacity'],
		scaleIn: ['scale','opacity'],
		pulse: ['scale'],
	}
	const shortcutSignatures: Record<string, string> = {
		fadeIn: 'number | {duration?: number, delay?: number, easing?: EasingName}',
		slideUp: 'number | {distance?: number, duration?: number, delay?: number, easing?: EasingName}',
		slideDown: 'number | {distance?: number, duration?: number, delay?: number, easing?: EasingName}',
		slideLeft: 'number | {distance?: number, duration?: number, delay?: number, easing?: EasingName}',
		slideRight: 'number | {distance?: number, duration?: number, delay?: number, easing?: EasingName}',
		scaleIn: 'number | {scale?: number, duration?: number, delay?: number, easing?: EasingName}',
		pulse: 'boolean | {scale?: number, duration?: number, delay?: number}',
	}
	const shortcutsDetailed = animationShortcutKeys.map((key) => ({
		key,
		affects: shortcutToProps[key] ?? [],
		signature: shortcutSignatures[key] ?? 'unknown',
	}))
	const shortcutsPretty = shortcutsDetailed.map((s) => `${s.key}${s.affects.length ? ` (${s.affects.join(', ')})` : ''}`)

	// Build unified per-key view to avoid repetition in consumers
	const elementPropsMerged: Record<string, {type: string; enumValues?: string[]; isPropertyShortcut?: boolean; shortcutOf?: string; isAnimationShortcut?: boolean; affects?: string[]; signature?: string}> = {}
	const mergedKeys = uniqueSorted([...elementKeys, ...Object.keys(propertyShortcuts), ...animationShortcutKeys])
	for (const key of mergedKeys) {
		const baseType = elementPropTypes[key] ?? (animationShortcutKeys.includes(key) ? 'shortcut' : 'unknown')
		const entry: {type: string; enumValues?: string[]; isPropertyShortcut?: boolean; shortcutOf?: string; isAnimationShortcut?: boolean; affects?: string[]; signature?: string} = {type: baseType}
		// Attach enum values for enum-typed keys
		if (key === 'align') entry.enumValues = alignEnum
		if (key === 'justify') entry.enumValues = justifyEnum
		if (key === 'fw') entry.enumValues = ['normal','bold']
		if (key === 'wrap') entry.enumValues = ['wrap','nowrap','wrap-reverse']
		if (key === 'type') entry.enumValues = elementTypes
		if (propertyShortcuts[key]) {
			entry.isPropertyShortcut = true
			entry.shortcutOf = propertyShortcuts[key]
		}
		const anim = shortcutsDetailed.find((s) => s.key === key)
		if (anim) {
			entry.isAnimationShortcut = true
			entry.affects = anim.affects
			entry.signature = anim.signature
		}
		elementPropsMerged[key] = entry
	}

	const syntax: ParserSyntax = {
		topLevelKeys: ['scene','scenes'],
		sceneProps: sceneKeys,
		cameraInitialProps,
		elementTypes,
		scenePropTypes,
		cameraInitialPropTypes,
		elementPropsMerged,
		enums: {
			align: alignEnum,
			justify: justifyEnum,
			easing: easingEnum.length ? easingEnum : ['linear','easeIn','easeOut','easeInOut'],
			layoutType: ['row','column'],
			positionUnit: ['px','percent','canvas'],
			sizeUnit: ['px','percent','auto'],
			elementTypes,
		},
		animation: {
			stepTypes: ['tween','anime','focus','custom','css'],
			commonFields: commonAnimationFields,
			tweenProperties: tweenProps,
			tweenValueType: 'number | percent-string',
			easingValues: easingEnum.length ? easingEnum : ['linear','easeIn','easeOut','easeInOut'],
			shortcuts: animationShortcutKeys,
		},
	}

	return syntax
}

/**
 * Exports the computed parser syntax in YAML or JSON format.
 * Defaults to YAML for easy embedding in docs.
 */
export const exportParserSyntax = (format: 'yaml' | 'json' = 'yaml'): string => {
	const syntax = computeParserSyntax()

	if (format === 'json') return JSON.stringify(syntax, null, 2)
		
	return YAML.stringify(syntax)
}

// ---- Timeline-only scheduling helpers ----
const getAnimationDurationFrames = (anim: Animation, fps: number): number => {
	let frames = 0
	for (const st of anim.steps || []) {
		const delay = Math.round((st as any).delay ? ((st as any).delay as number) * fps : 0)
		frames += delay
		if ((st as any).type === 'tween') frames += Math.max(1, Math.round((st as any).duration * fps))
		else if ((st as any).type === 'anime') {
			// Try to infer from provided duration or from props breakdown
			const d = (st as any).duration as number | undefined
			if (d != null) {
				frames += Math.max(1, Math.round(d * fps))
			} else {
				const rawProps = (st as any).props || {}
				const ms = computeAnimePropsDurationMs(normalizeAnimeProps({...rawProps}))
				const sec = ms > 0 ? (ms / 1000) : 1
				frames += Math.max(1, Math.round(sec * fps))
			}
		}
		else if ((st as any).type === 'focus') frames += Math.max(1, Math.round((st as any).duration * fps))
		else if ((st as any).type === 'custom') frames += Math.max(1, Math.round((st as any).duration * fps))
		else if ((st as any).type === 'css') frames += Math.max(1, Math.round((st as any).duration * fps))
	}
	return frames
}

type ScheduledAnim = {startFrame: number; anim: Animation}

const normalizeTimeline = (timeline: Scene['timeline']): TimelineEvent[] => {
	if (!timeline) return []
	if (Array.isArray(timeline)) return timeline as TimelineEvent[]
	if (Array.isArray((timeline as any).events)) return (timeline as any).events as TimelineEvent[]
	return []
}

const scheduleAnimations = (
	animations: Animation[] | undefined,
	fps: number,
	sceneTimeline?: Scene['timeline'],
	registry?: AnimRegistry
): ScheduledAnim[] => {
	if (!animations || animations.length === 0) return []

	const events = normalizeTimeline(sceneTimeline)
	const eventById = new Map<string, {id: string; at?: number; after?: string}>()
	for (const ev of events) eventById.set(ev.id, ev as any)

	const eventFrames = new Map<string, number>()
	const animStartFrames = new Map<string, number>()

	const resolveAnim = (animId: string): number => {
		if (animStartFrames.has(animId)) return animStartFrames.get(animId)!
		// 1) If there is an event with the same id, use it
		if (eventById.has(animId)) {
			const f = resolveEvent(animId)
			animStartFrames.set(animId, f)
			return f
		}
		// 2) If the animation exists and defines on/after, consider it
		const anim = registry?.get(animId)
		if (anim) {
			// on/trigger
			const triggerId = (anim.on ?? (anim.trigger && anim.trigger !== 'start' ? anim.trigger : undefined))
			if (triggerId) {
				const base = resolveEvent(triggerId)
				const withDelay = base + Math.round(((anim.delay ?? 0) as number) * fps)
				animStartFrames.set(animId, withDelay)
				return withDelay
			}
			// after
			if (anim.after) {
				// after another animation id
				if (registry?.has(anim.after)) {
					const dep = registry.get(anim.after)!
					const depStart = resolveAnim(anim.after)
					const depEnd = depStart + getAnimationDurationFrames(dep, fps)
					const withDelay = depEnd + Math.round(((anim.delay ?? 0) as number) * fps)
					animStartFrames.set(animId, withDelay)
					return withDelay
				}
				// after an event id
				const base = resolveEvent(anim.after)
				const withDelay = base + Math.round(((anim.delay ?? 0) as number) * fps)
				animStartFrames.set(animId, withDelay)
				return withDelay
			}
		}
		// 3) default 0
		animStartFrames.set(animId, 0)
		return 0
	}

	const resolveEvent = (id: string): number => {
		if (eventFrames.has(id)) return eventFrames.get(id)!
		const ev = eventById.get(id)
		if (!ev) {
			eventFrames.set(id, 0)
			return 0
		}
		if (ev.at != null) {
			const delays = Math.max(0, Math.round(((ev as any).delay ?? 0) * fps))
			const f = Math.max(0, Math.round(ev.at * fps)) + delays
			eventFrames.set(id, f)
			return f
		}
		if (ev.after) {
			// after can refer to another event id
			if (eventById.has(ev.after)) {
				const base = resolveEvent(ev.after)
				const withDelay = base + Math.max(0, Math.round(((ev as any).delay ?? 0) * fps))
				eventFrames.set(id, withDelay)
				return withDelay
			}
			// or after an animation id → after it finishes
			if (registry && registry.has(ev.after)) {
				const dep = registry.get(ev.after)!
				const depStart = resolveAnim(ev.after)
				const depEnd = depStart + getAnimationDurationFrames(dep, fps)
				const withDelay = depEnd + Math.max(0, Math.round(((ev as any).delay ?? 0) * fps))
				eventFrames.set(id, withDelay)
				return withDelay
			}
		}
		eventFrames.set(id, 0)
		return 0
	}

	const out: ScheduledAnim[] = []
	for (const anim of animations) {
		let start = 0
		if (anim.id) {
			start = resolveAnim(anim.id)
		} else if (anim.on || (anim.trigger && anim.trigger !== 'start')) {
			const trig = anim.on ?? anim.trigger!
			start = resolveEvent(trig)
		} else if (anim.after) {
			if (eventById.has(anim.after)) start = resolveEvent(anim.after)
			else if (registry && registry.has(anim.after)) {
				const dep = registry.get(anim.after)!
				const depStart = resolveAnim(anim.after)
				start = depStart + getAnimationDurationFrames(dep, fps)
			}
		}
		// Apply top-level animation delay
		start += Math.round(((anim.delay ?? 0) as number) * fps)
		out.push({startFrame: start, anim})
	}
	out.sort((a, b) => a.startFrame - b.startFrame)
	return out
}

// (moved earlier) computeAnimatedFromSchedule / computeAnimatedFromSchedulePercentAware defined above

const collectAnimationRegistry = (scene: Scene): AnimRegistry => {
	const reg: AnimRegistry = new Map()
	const addAll = (anims?: Animation[]) => {
		if (!anims) return
		for (const a of anims) if (a && a.id) reg.set(a.id, a)
	}
	const walk = (nodes?: ElementNode[]) => {
		if (!nodes) return
		for (const n of nodes) {
			addAll(n.animations)
			walk(n.children)
		}
	}
	addAll(scene.camera?.animations)
	walk(scene.elements)
	return reg
}

// Color helpers
type RGBA = {r: number; g: number; b: number; a: number}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const parseHex = (hex: string): RGBA | null => {
	hex = hex.trim()
	if (!hex.startsWith('#')) return null
	const h = hex.slice(1)
	if (h.length === 3) {
		const r = parseInt(h[0] + h[0], 16)
		const g = parseInt(h[1] + h[1], 16)
		const b = parseInt(h[2] + h[2], 16)
		return {r, g, b, a: 1}
	}
	if (h.length === 6) {
		const r = parseInt(h.slice(0, 2), 16)
		const g = parseInt(h.slice(2, 4), 16)
		const b = parseInt(h.slice(4, 6), 16)
		return {r, g, b, a: 1}
	}
	return null
}
const parseRgb = (str: string): RGBA | null => {
	const m = /^rgba?\(([^)]+)\)$/i.exec(str.trim())
	if (!m) return null
	const parts = m[1].split(',').map((s) => s.trim())
	const r = Number(parts[0])
	const g = Number(parts[1])
	const b = Number(parts[2])
	const a = parts[3] != null ? Number(parts[3]) : 1
	if ([r,g,b].some((n)=>!Number.isFinite(n))) return null
	return {r, g, b, a: Number.isFinite(a) ? clamp01(a) : 1}
}
const toRgba = (c: string | undefined): RGBA | null => {
	if (!c) return null
	return parseHex(c) || parseRgb(c)
}
const formatRgba = ({r,g,b,a}: RGBA): string => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpColor = (from: RGBA, to: RGBA, t: number): RGBA => ({
	r: lerp(from.r, to.r, t),
	g: lerp(from.g, to.g, t),
	b: lerp(from.b, to.b, t),
	a: lerp(from.a, to.a, t),
})

const computeAnimatedColor = (
	steps: (TweenStep | CameraFocusStep | CustomStep | CssStep | AnimeStep)[] | undefined,
	property: string,
	frame: number,
	fps: number,
	initial?: string,
	initialOffsetFrames: number = 0
): string | undefined => {
	if (!steps) return initial
	let current: string | undefined = initial
	let timeCursor = initialOffsetFrames
	for (const step of steps) {
		if (!step) continue
		const delay = Math.round(((step as any).delay ? ((step as any).delay as number) : 0) * fps)
		timeCursor += delay
		if (step.type === 'tween') {
			const tween = step as TweenStep
			const durationFrames = Math.max(1, Math.round(tween.duration * fps))
			const easingFn = mapEasing(tween.easing)
			const prop = tween.properties ? (tween.properties as any)[property] : undefined
			if (prop) {
				const fromCol = toRgba(typeof prop.from === 'string' ? prop.from : (current as string)) || toRgba(current || '')
				const toCol = toRgba(String(prop.to))
				if (toCol) {
					if (frame < timeCursor) {
						if (!current && fromCol) current = formatRgba(fromCol)
					} else if (frame >= timeCursor && frame < timeCursor + durationFrames) {
						const t = easingFn((frame - timeCursor) / durationFrames)
						const start = fromCol || toCol
						current = formatRgba(lerpColor(start, toCol, clamp01(t)))
					} else {
						current = formatRgba(toCol)
					}
				}
			}
			timeCursor += durationFrames
		} else {
			const durSec = (step as any).duration as number | undefined
			if (durSec && durSec > 0) {
				const durationFrames = Math.max(1, Math.round(durSec * fps))
				timeCursor += durationFrames
			}
		}
	}
	return current
}

const computeAnimatedFromSchedule = (
	schedule: ScheduledAnim[],
	property: string,
	frame: number,
	fps: number,
	initial?: number
): number | undefined => {
	let current: number | undefined = initial
	for (const {startFrame, anim} of schedule) {
		const val = computeAnimated(anim.steps as any, property, frame, fps, current, startFrame)
		current = val
	}
	return current
}

// Percent-aware variant for properties that can be expressed as percentages (e.g., "0%".."100%").
// Converts percent values to absolute numbers based on percentBase before evaluating.
const computeAnimatedFromSchedulePercentAware = (
	schedule: ScheduledAnim[],
	property: string,
	frame: number,
	fps: number,
	initial: number | undefined,
	percentBase: number | undefined
): number | undefined => {
	let current: number | undefined = initial
	const toAbs = (v: number | string | undefined): number | undefined => {
		if (v == null) return undefined
		if (typeof v === 'number') return v
		const m = /^(-?\d+(?:\.\d+)?)%$/.exec(v)
		if (m && percentBase != null) return (parseFloat(m[1]) / 100) * percentBase
		const n = Number.parseFloat(String(v))
		return Number.isFinite(n) ? n : undefined
	}
	for (const {startFrame, anim} of schedule) {
		const steps = (anim?.steps || []) as any[]
		const mapped = steps.map((st) => {
			if (!st || (st as any).type !== 'tween') return st
			const tw = st as any
			const props = tw.properties || {}
			if (props && Object.prototype.hasOwnProperty.call(props, property)) {
				const p = props[property] || {}
				const from = toAbs(p.from)
				const to = toAbs(p.to)
				const newProps = {...props, [property]: {
					...(p.from != null ? {from} : {}),
					to: to as number
				}}
				return {...tw, properties: newProps}
			}
			return st
		})
		const val = computeAnimated(mapped as any, property, frame, fps, current, startFrame)
		current = val
	}
	return current
}

const computeAnimatedColorFromSchedule = (
	schedule: ScheduledAnim[],
	property: string,
	frame: number,
	fps: number,
	initial?: string
): string | undefined => {
	let current: string | undefined = initial
	for (const {startFrame, anim} of schedule) {
		const val = computeAnimatedColor(anim.steps as any, property, frame, fps, current, startFrame)
		current = val
	}
	return current
}

// --- anime ease normalization helpers ---
const DEFAULT_ANIME_EASE = 'inOutSine'
const mapAnimeEaseAlias = (ease: any): any => {
	if (typeof ease !== 'string') return ease
	const m: Record<string, string> = {
		// common aliases -> anime tokens
		linear: 'linear',
		ease: 'inOutSine',
		easeIn: 'inQuad',
		easeOut: 'outQuad',
		easeInOut: 'inOutQuad',
		easeInQuad: 'inQuad',
		easeOutQuad: 'outQuad',
		easeInOutQuad: 'inOutQuad',
		easeInCubic: 'inCubic',
		easeOutCubic: 'outCubic',
		easeInOutCubic: 'inOutCubic',
		easeInSine: 'inSine',
		easeOutSine: 'outSine',
		easeInOutSine: 'inOutSine',
		easeInBack: 'inBack',
		easeOutBack: 'outBack',
		easeInOutBack: 'inOutBack',
		easeInExpo: 'inExpo',
		easeOutExpo: 'outExpo',
		easeInOutExpo: 'inOutExpo',
		easeInBounce: 'inBounce',
		easeOutBounce: 'outBounce',
		easeInOutBounce: 'inOutBounce',
	}
	return m[ease] ?? ease
}

const normalizeAnimeProps = (raw: any): any => {
	if (!raw || typeof raw !== 'object') return raw
	const props: any = Array.isArray(raw) ? raw.map((v) => normalizeAnimeProps(v)) : {...raw}
	if (!Array.isArray(raw)) {
		if (props.ease != null) props.ease = mapAnimeEaseAlias(props.ease)
		else props.ease = DEFAULT_ANIME_EASE
		for (const key of Object.keys(props)) {
			if (key === 'targets') continue
			const val = props[key]
			if (Array.isArray(val)) {
				props[key] = val.map((entry) => {
					if (entry && typeof entry === 'object') {
						const e: any = {...entry}
						if (e.ease != null) e.ease = mapAnimeEaseAlias(e.ease)
						else e.ease = DEFAULT_ANIME_EASE
						return e
					}
					return entry
				})
			} else if (val && typeof val === 'object') {
				props[key] = normalizeAnimeProps(val)
				if ((props[key] as any).ease == null) (props[key] as any).ease = DEFAULT_ANIME_EASE
			}
		}
	}
	return props
}

// Map anime token (inQuad/outCubic/...) to our Remotion easing name
const mapAnimeTokenToRemotion = (token: string): EasingName => {
  switch (token) {
    case 'linear': return 'linear'
    case 'inQuad': return 'easeInQuad'
    case 'outQuad': return 'easeOutQuad'
    case 'inOutQuad': return 'easeInOutQuad'
    case 'inCubic': return 'easeInCubic'
    case 'outCubic': return 'easeOutCubic'
    case 'inOutCubic': return 'easeInOutCubic'
    case 'inSine': return 'easeInSine'
    case 'outSine': return 'easeOutSine'
    case 'inOutSine': return 'easeInOutSine'
    case 'inBack': return 'easeInBack'
    case 'outBack': return 'easeOutBack'
    case 'inOutBack': return 'easeInOutBack'
    case 'inExpo': return 'easeInExpo'
    case 'outExpo': return 'easeOutExpo'
    case 'inOutExpo': return 'easeInOutExpo'
    case 'inBounce': return 'easeInBounce'
    case 'outBounce': return 'easeOutBounce'
    case 'inOutBounce': return 'easeInOutBounce'
    default: return 'linear'
  }
}

// Compute anime-driven numeric value using our Remotion easing mapping instead of anime easing
const computeAnimeNumericFromSchedule = (
  schedule: ScheduledAnim[],
  property: string,
  frame: number,
  fps: number,
  initial: number | undefined
): number | undefined => {
  let current: number | undefined = initial
  for (const {startFrame, anim} of schedule) {
    const steps = (anim?.steps || []) as any[]
    for (const st of steps) {
      if (!st || (st as any).type !== 'anime') continue
      const stDelay = Math.round((((st as any).delay ?? 0) as number) * fps)
      const stepStart = startFrame + stDelay
      const rawProps = (st as any).props || {}
      const props = normalizeAnimeProps({...rawProps})
      const propSpec: any = (props as any)[property]
      if (propSpec == null) continue
      const stepDurFrames = Number.isFinite((st as any).duration) ? Math.max(0, Math.round(((st as any).duration as number) * fps)) : 0
      // Build segments according to keyframes or single object
      const segments: {start: number; dur: number; from: number; to: number; ease: (t:number)=>number}[] = []
      let timeCursor = stepStart
      const coerceNum = (v: any, fallback: number | undefined): number | undefined => {
        if (v == null) return fallback
        if (typeof v === 'number') return v
        const m = /^(-?\d+(?:\.\d+)?)%$/.exec(String(v))
        if (m) return Number.parseFloat(m[1]) // percent handling left to caller where needed
        const n = Number.parseFloat(String(v))
        return Number.isFinite(n) ? n : fallback
      }
      const getEaseFn = (e?: any) => {
        const token = mapAnimeEaseAlias(e ?? (props as any).ease ?? DEFAULT_ANIME_EASE)
        const remotionName = mapAnimeTokenToRemotion(String(token))
        return mapEasing(remotionName)
      }
      if (Array.isArray(propSpec)) {
        let runningFrom = current
        const kfCount = propSpec.filter((kf:any)=>kf && typeof kf==='object').length || 1
        const defaultKfDur = kfCount > 0 && stepDurFrames > 0 ? Math.max(1, Math.round(stepDurFrames / kfCount)) : 0
        for (const kf of propSpec) {
          if (!kf || typeof kf !== 'object') continue
          const kfDelay = Number.isFinite(kf.delay) ? Math.max(0, Math.round((kf.delay as number) / 1000 * fps)) : 0
          let dur = Number.isFinite(kf.duration) ? Math.max(1, Math.round((kf.duration as number) / 1000 * fps)) : 0
          if (dur === 0) dur = defaultKfDur
          const easeFn = getEaseFn(kf.ease)
          const fromVal = coerceNum(kf.from, runningFrom)
          const toVal = coerceNum(kf.to ?? kf.value, fromVal ?? runningFrom)
          if (fromVal == null || toVal == null) { timeCursor += kfDelay + dur; runningFrom = toVal ?? runningFrom; continue }
          const start = timeCursor + kfDelay
          segments.push({start, dur, from: fromVal, to: toVal, ease: easeFn})
          timeCursor = start + dur
          runningFrom = toVal
        }
      } else if (propSpec && typeof propSpec === 'object') {
        const kfDelay = Number.isFinite(propSpec.delay) ? Math.max(0, Math.round((propSpec.delay as number) / 1000 * fps)) : 0
        let dur = Number.isFinite(propSpec.duration) ? Math.max(1, Math.round((propSpec.duration as number) / 1000 * fps)) : 0
        if (dur === 0) dur = Math.max(1, stepDurFrames)
        const easeFn = getEaseFn(propSpec.ease)
        const fromVal = coerceNum(propSpec.from, current)
        const toVal = coerceNum(propSpec.to ?? propSpec.value, fromVal ?? current)
        if (fromVal != null && toVal != null) {
          const start = stepStart + kfDelay
          segments.push({start, dur, from: fromVal, to: toVal, ease: easeFn})
        }
      } else {
        // primitive not supported
      }
      // Evaluate segments in order and set current if frame falls within or past
      for (const seg of segments) {
        if (frame < seg.start) break
        if (frame >= seg.start && frame < seg.start + seg.dur) {
          const t = (frame - seg.start) / Math.max(1, seg.dur)
          const tt = seg.ease(Math.max(0, Math.min(1, t)))
          current = seg.from + (seg.to - seg.from) * tt
        } else if (frame >= seg.start + seg.dur) {
          current = seg.to
        }
      }
    }
  }
  return current
}

// Estimate total duration in ms for anime props (longest property track + top-level delay)
const computeAnimePropsDurationMs = (props: any): number => {
	if (!props || typeof props !== 'object') return 0
	const exclude = new Set(['targets','stagger','ease','easing','loop','loopDelay','direction','autoplay','yoyo','iterationCount','fill','playState','position'])
	const num = (v: any): number => (typeof v === 'number' && isFinite(v) ? v : 0)
	const keyframesDur = (arr: any[]): number => {
		let total = 0
		for (const kf of arr) {
			if (kf && typeof kf === 'object') total += num(kf.duration) + num(kf.delay)
		}
		return total
	}
	let maxTrack = 0
	for (const key of Object.keys(props)) {
		if (exclude.has(key)) continue
		const val = (props as any)[key]
		let track = 0
		if (Array.isArray(val)) {
			track = keyframesDur(val)
		} else if (val && typeof val === 'object') {
			track = num(val.duration) + num(val.delay)
		} else {
			track = 0
		}
		if (track > maxTrack) maxTrack = track
	}
	const topLevelDuration = num(props.duration)
	const base = Math.max(maxTrack, topLevelDuration)
	return base + num(props.delay)
}