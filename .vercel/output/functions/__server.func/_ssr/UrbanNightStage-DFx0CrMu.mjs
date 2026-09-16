import { a as __toESM } from "../_runtime.mjs";
import { a as useFrame, c as require_jsx_runtime, l as require_react } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/UrbanNightStage-DFx0CrMu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FLOOR_WIDTH = 24;
var FLOOR_DEPTH = 10;
var P1_X = -1.8;
var P2_X = 1.8;
function TrainingStage({ p1Color, p2Color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [FLOOR_WIDTH, FLOOR_DEPTH] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#111111",
				roughness: .85,
				metalness: .15
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("gridHelper", {
			args: [
				FLOOR_WIDTH,
				24,
				"#222222",
				"#1a1a1a"
			],
			position: [
				0,
				.002,
				0
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.003,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.04, FLOOR_DEPTH] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#facc15",
				emissive: "#facc15",
				emissiveIntensity: .4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				3,
				-5
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [FLOOR_WIDTH, 8] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#0a0a0a",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-12,
				3,
				0
			],
			rotation: [
				0,
				Math.PI / 2,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [FLOOR_DEPTH, 8] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#080808",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				FLOOR_WIDTH / 2,
				3,
				0
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [FLOOR_DEPTH, 8] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#080808",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				P1_X,
				.5,
				0
			],
			intensity: 1.2,
			color: p1Color,
			distance: 4,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				P2_X,
				.5,
				0
			],
			intensity: 1.2,
			color: p2Color,
			distance: 4,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				0,
				6,
				-4
			],
			intensity: .6,
			color: "#1a1a2e",
			distance: 20,
			decay: 1
		})
	] });
}
function NeonStrip({ position, rotation, width, color, flickerSpeed = 1.3 }) {
	const lightRef = (0, import_react.useRef)(null);
	useFrame(({ clock }) => {
		if (!lightRef.current) return;
		const t = clock.elapsedTime * flickerSpeed;
		const flicker = .85 + .15 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
		lightRef.current.intensity = 1.8 * flicker;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position,
		rotation,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			width,
			.06,
			.06
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: 2.5
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			ref: lightRef,
			color,
			intensity: 1.8,
			distance: 6,
			decay: 2
		})]
	});
}
function BrickWallPanel({ position, rotation, width, height }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position,
		rotation,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [width, height] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#1a1210",
					roughness: .95,
					metalness: 0
				})]
			}),
			Array.from({ length: Math.floor(height / .35) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					-height / 2 + i * .35 + .175,
					.01
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [width, .02] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#0d0b09",
					roughness: 1
				})]
			}, `h${i}`)),
			Array.from({ length: Math.floor(height / .35) }).map((_, row) => Array.from({ length: Math.floor(width / .7) + 1 }).map((_, col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-width / 2 + col * .7 + (row % 2 === 0 ? 0 : .35),
					-height / 2 + row * .35 + .175,
					.012
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.02, .33] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#0d0b09",
					roughness: 1
				})]
			}, `v${row}-${col}`)))
		]
	});
}
function ChainlinkFence({ position, rotation, width, height }) {
	const posts = Math.floor(width / 2.5) + 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position,
		rotation,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [width, height] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#080808",
				roughness: 1,
				transparent: true,
				opacity: .7
			})] }),
			Array.from({ length: posts }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-width / 2 + i * (width / (posts - 1)),
					0,
					.05
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.06,
					height,
					.06
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#2a2a2a",
					roughness: .6,
					metalness: .8
				})]
			}, `post${i}`)),
			[
				height / 2 - .1,
				0,
				-height / 2 + .1
			].map((y, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					y,
					.05
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					width,
					.05,
					.05
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#2a2a2a",
					roughness: .6,
					metalness: .8
				})]
			}, `rail${i}`))
		]
	});
}
function UrbanNightStage({ p1Color, p2Color }) {
	const P1_X = -1.8;
	const P2_X = 1.8;
	const FLOOR_W = 22;
	const FLOOR_D = 12;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [FLOOR_W, FLOOR_D] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1c1c1c",
				roughness: .92,
				metalness: .08
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.003,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.03, FLOOR_D] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#141414",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-3,
				.003,
				0
			],
			rotation: [
				-Math.PI / 2,
				.15,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.02, 5] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#141414",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				4,
				.003,
				-1
			],
			rotation: [
				-Math.PI / 2,
				-.1,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.02, 4] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#141414",
				roughness: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.004,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.05, FLOOR_D] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#facc15",
				emissive: "#facc15",
				emissiveIntensity: .15,
				transparent: true,
				opacity: .4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				45,
				32,
				16
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: "#050508",
				side: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				4,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				28,
				28,
				20,
				32,
				1,
				true
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: "#0a0810",
				side: 1,
				transparent: true,
				opacity: .95
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrickWallPanel, {
			position: [
				0,
				3.5,
				-9
			],
			width: 22,
			height: 9
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrickWallPanel, {
			position: [
				-10,
				3.5,
				-4
			],
			rotation: [
				0,
				Math.PI / 2,
				0
			],
			width: 10,
			height: 9
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrickWallPanel, {
			position: [
				10,
				3.5,
				-4
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			width: 10,
			height: 9
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChainlinkFence, {
			position: [
				0,
				2.5,
				-8.5
			],
			width: 22,
			height: 5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				0,
				6.8,
				-8.8
			],
			width: 18,
			color: "#7c3aed",
			flickerSpeed: .9
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				-6,
				4.2,
				-8.7
			],
			width: 6,
			color: "#9333ea",
			flickerSpeed: 1.7
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				6,
				4.2,
				-8.7
			],
			width: 6,
			color: "#9333ea",
			flickerSpeed: 1.4
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				-8,
				.3,
				-7
			],
			rotation: [
				0,
				Math.PI / 2,
				0
			],
			width: 3,
			color: "#eab308",
			flickerSpeed: 2.1
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				8,
				.3,
				-7
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			width: 3,
			color: "#eab308",
			flickerSpeed: 1.8
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				-9,
				3,
				-8.4
			],
			rotation: [
				0,
				Math.PI / 2,
				0
			],
			width: 2,
			color: "#06b6d4",
			flickerSpeed: 1.1
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonStrip, {
			position: [
				9,
				3,
				-8.4
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			width: 2,
			color: "#dc2626",
			flickerSpeed: 1.6
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: .04,
			color: "#1a1020"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				0,
				9,
				3
			],
			"target-position": [
				0,
				0,
				0
			],
			intensity: 4.5,
			color: "#6d28d9",
			angle: .35,
			penumbra: .5,
			distance: 18,
			decay: 1.5,
			castShadow: true,
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				-8,
				7,
				1
			],
			"target-position": [
				-4,
				0,
				-6
			],
			intensity: 3,
			color: "#7c3aed",
			angle: .45,
			penumbra: .7,
			distance: 20,
			decay: 1.5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				8,
				6,
				2
			],
			"target-position": [
				3,
				0,
				-2
			],
			intensity: 3.5,
			color: "#ca8a04",
			angle: .4,
			penumbra: .6,
			distance: 16,
			decay: 1.5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				0,
				5,
				-7
			],
			"target-position": [
				0,
				1,
				0
			],
			intensity: 2,
			color: "#1e40af",
			angle: .5,
			penumbra: .8,
			distance: 14,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				P1_X,
				.4,
				0
			],
			intensity: 1.5,
			color: p1Color,
			distance: 5,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				P2_X,
				.4,
				0
			],
			intensity: 1.5,
			color: p2Color,
			distance: 5,
			decay: 2
		})
	] });
}
//#endregion
export { UrbanNightStage as n, TrainingStage as t };
