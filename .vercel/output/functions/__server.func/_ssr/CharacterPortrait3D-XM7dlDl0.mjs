import { a as __toESM } from "../_runtime.mjs";
import { H as LoopRepeat, _ as Color, a as useFrame, c as require_jsx_runtime, d as AnimationMixer, i as Canvas, l as require_react, o as useThree, p as Box3, xt as Vector3 } from "../_libs/@react-three/drei+[...].mjs";
import { t as SkeletonUtils } from "../_libs/three-stdlib.mjs";
import { i as determineForwardCorrection } from "./CharacterPipeline-B4ferr0o.mjs";
import { n as GLTFLoader, t as MeshoptDecoder } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CharacterPortrait3D-XM7dlDl0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* NORMALIZATION CONTRACT (v10 — Universal Box3 + Forward Detection):
*
* All characters use the same Box3 normalization as FighterMesh:
*   - Scale to 2.0 units tall
*   - Offset so bottom of bounding box sits at Y=0
*   - No character-specific manual offsets
*   - Forward direction auto-detected: models facing +Z get 180° Y correction
*     applied to the inner scene group (not the outer portrait rotation group)
*
* PORTRAIT ORIENTATION IS COMPLETELY DECOUPLED FROM IN-FIGHT ORIENTATION.
*/
/** Select the best idle animation clip from available clips */
function selectIdleClip(clips) {
	for (const keyword of [
		"idle",
		"stand",
		"neutral",
		"ready",
		"wait",
		"rest",
		"bind",
		"tpose",
		"t-pose"
	]) {
		const found = clips.find((a) => a.name.toLowerCase().includes(keyword));
		if (found) return found;
	}
	return clips[0];
}
/** Fixed camera — all models normalized to Y=0 baseline */
function FixedCamera({ mode }) {
	const { camera } = useThree();
	(0, import_react.useEffect)(() => {
		const cam = camera;
		if (mode === "bust") {
			cam.fov = 28;
			cam.position.set(0, 1.6, 3.2);
			cam.lookAt(0, 1.4, 0);
		} else {
			cam.fov = 40;
			cam.position.set(0, 1, 4.5);
			cam.lookAt(0, 1, 0);
		}
		cam.updateProjectionMatrix();
	}, [mode, camera]);
	return null;
}
/** 3-Point Portrait Lighting */
function PortraitLighting({ factionColor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: .25,
			color: "#e8eaf0"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				2.5,
				3.5,
				3
			],
			intensity: 2.2,
			color: "#fff5e8",
			castShadow: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-2,
				2,
				2.5
			],
			intensity: .75,
			color: factionColor,
			castShadow: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				.5,
				4,
				-3.5
			],
			intensity: 1.4,
			color: "#c8d8ff",
			castShadow: false
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				0,
				1.3,
				1.8
			],
			intensity: .3,
			color: factionColor,
			distance: 4,
			decay: 2
		})
	] });
}
function PortraitModel({ modelUrl, factionColor, mode = "bust", flash = false, flip = false, rotationY }) {
	const mixerRef = (0, import_react.useRef)(null);
	const [model, setModel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		const loader = new GLTFLoader();
		loader.setMeshoptDecoder(MeshoptDecoder);
		loader.load(modelUrl, (gltf) => {
			if (!active) return;
			const cloned = SkeletonUtils.clone(gltf.scene);
			cloned.traverse((child) => {
				if (child.isSkinnedMesh) {
					child.frustumCulled = false;
					child.normalizeSkinWeights();
				}
			});
			cloned.updateMatrixWorld(true);
			const rawSize = new Box3().setFromObject(cloned).getSize(new Vector3());
			const scale = rawSize.y > 0 ? 2 / rawSize.y : 1;
			cloned.scale.setScalar(scale);
			cloned.updateMatrixWorld(true);
			const scaledBox = new Box3().setFromObject(cloned);
			const scaledCenter = scaledBox.getCenter(new Vector3());
			cloned.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z);
			cloned.rotation.set(0, 0, 0);
			cloned.updateMatrixWorld(true);
			const forwardCorrectionY = determineForwardCorrection(cloned);
			const color = new Color(factionColor);
			cloned.traverse((child) => {
				if (!child.isMesh) return;
				const mesh = child;
				(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mat) => {
					const m = mat;
					if (m.isMeshStandardMaterial) {
						m.emissive = color;
						m.emissiveIntensity = .06;
						m.needsUpdate = true;
					}
				});
			});
			if (gltf.animations && gltf.animations.length > 0) {
				mixerRef.current = new AnimationMixer(cloned);
				const clonedClip = selectIdleClip(gltf.animations).clone();
				const action = mixerRef.current.clipAction(clonedClip, cloned);
				action.setLoop(LoopRepeat, Infinity);
				action.fadeIn(.3);
				action.play();
			}
			setModel({
				scene: cloned,
				forwardCorrectionY
			});
		}, void 0, (err) => console.warn("[Portrait] GLB load failed:", modelUrl, err));
		return () => {
			active = false;
			mixerRef.current?.stopAllAction();
			mixerRef.current = null;
		};
	}, [modelUrl, factionColor]);
	useFrame((_, delta) => {
		mixerRef.current?.update(delta);
	});
	if (!model) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		rotation: [
			0,
			rotationY !== void 0 ? rotationY : flip ? Math.PI : 0,
			0
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			rotation: [
				0,
				model.forwardCorrectionY,
				0
			],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: model.scene })
		})
	});
}
function PortraitScene({ modelUrl, factionColor, mode = "bust", flash = false, flip = false, rotationY }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FixedCamera, { mode }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortraitLighting, { factionColor }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortraitModel, {
				modelUrl,
				factionColor,
				mode,
				flash,
				flip,
				rotationY
			})
		})
	] });
}
function CharacterPortrait3D({ modelUrl, factionColor, mode = "bust", flash = false, flip = false, rotationY }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 pointer-events-none",
			style: { background: `radial-gradient(ellipse at 50% 80%, ${factionColor}22 0%, transparent 70%)` }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
			gl: {
				antialias: false,
				alpha: true
			},
			style: {
				width: "100%",
				height: "100%",
				filter: flash ? "brightness(1.8)" : void 0,
				transition: "filter 0.05s"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortraitScene, {
				modelUrl,
				factionColor,
				mode,
				flash,
				flip,
				rotationY
			})
		})]
	});
}
//#endregion
export { CharacterPortrait3D as default };
