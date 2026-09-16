import { a as __toESM } from "../_runtime.mjs";
import { r as getFighterGlbUrl } from "./bannonGlbRoster-DSrchjC5.mjs";
import { H as LoopRepeat, V as LoopOnce, a as useFrame, c as require_jsx_runtime, i as Canvas, it as PlaneGeometry, l as require_react, o as useThree, p as Box3, r as useGLTF, xt as Vector3 } from "../_libs/@react-three/drei+[...].mjs";
import { a as inferSemanticStateFromClipName, n as COMBAT_STATE_TO_SEMANTIC, o as runCharacterPipeline, r as SEMANTIC_STATE_ALIASES, s as validateAnimationChannelBones, t as AnimationRetargeter } from "./CharacterPipeline-B4ferr0o.mjs";
import { n as BoneHitboxSystem } from "./BoneHitboxSystem-DOra5Syf.mjs";
import { r as runAnimationIntegrityGate, t as AutoRigDetector } from "./AnimationIntegrityGate-NStW_Fep.mjs";
import { n as UrbanNightStage, t as TrainingStage } from "./UrbanNightStage-DFx0CrMu.mjs";
import { r as resolveStageConfig } from "./StageConfig-DJ4pMRhO.mjs";
import { n as CHARACTER_BLOOM, r as ATTACK_ROOT_MOTION_PROFILES } from "./GameBattleArena-CYyWGmWz.mjs";
import { t as createNoise2D } from "../_libs/simplex-noise.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CombatArena3D-BGZYJMFr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* DEFORMATION INTEGRITY LOGGER
* ─────────────────────────────────────────────────────────────────────────────
* Backend-only agent debug system. No frontend UI.
*
* Runs the 14-point deformation integrity test on a fighter's normalized scene
* at combat entry. If any check fails, logs the character name + failing test
* and returns BLOCKED so the caller can freeze combat.
*
* AUTHORED SKELETON LAW: This module is read-only. It never modifies the scene,
* skeleton, weights, or any runtime state. It only observes and reports.
*
* 14-POINT TEST SUITE
* ────────────────────
*  1. SKELETON_EXISTS          — At least one Bone object in the scene hierarchy
*  2. SKELETON_HIERARCHY       — Every bone has a valid parent (except root)
*  3. INVERSE_BIND_MATRICES    — Every SkinnedMesh has a skeleton with bindMatrixInverse
*  4. SKINNED_MESH_SKELETON    — Every SkinnedMesh references a skeleton with > 0 bones
*  5. SKIN_INDICES_VALID       — skinIndex attribute exists on every SkinnedMesh geometry
*  6. MAX_FOUR_INFLUENCES      — No vertex has > 4 runtime influences (WebGL limit)
*  7. WEIGHTS_SUM_TO_ONE       — Per-vertex skin weights sum to ~1.0 (Khronos spec)
*  8. BIND_POSE_STABLE         — No NaN/Infinity in bone world matrices
*  9. FLOOR_NORMALIZATION      — Scene bounding box min.y is at or near 0
* 10. FORWARD_DIRECTION        — Forward correction was applied (or model is already correct)
* 11. FRUSTUM_CULLING_DISABLED — Every SkinnedMesh has frustumCulled = false
* 12. MIXER_TARGETS_CLONE      — AnimationMixer root matches the cloned scene object
* 13. ANIMATION_CLIPS_EXIST    — At least one AnimationAction is registered on the mixer
* 14. FIRST_FRAME_DISPLACEMENT — At least one SkinnedMesh vertex moves on first mixer tick
*                                (sampled non-destructively; mixer is reset after test)
*/
/** Tolerance for floor normalization check (units) */
var FLOOR_Y_TOLERANCE = .15;
/** Tolerance for weight sum check */
var WEIGHT_SUM_TOLERANCE = .05;
/** Minimum vertex displacement (units) to confirm first-frame deformation */
var MIN_VERTEX_DISPLACEMENT = 1e-4;
/** Number of vertices to sample for weight and displacement checks */
var SAMPLE_VERTEX_COUNT = 32;
function collectBones(scene) {
	const bones = [];
	scene.traverse((child) => {
		if (child.isBone) bones.push(child);
	});
	return bones;
}
function collectSkinnedMeshes(scene) {
	const meshes = [];
	scene.traverse((child) => {
		if (child.isSkinnedMesh) meshes.push(child);
	});
	return meshes;
}
function hasNaNOrInfinity(matrix) {
	for (const v of matrix.elements) if (!isFinite(v)) return true;
	return false;
}
/**
* Sample vertex positions from a SkinnedMesh geometry.
* Returns world-space positions for up to `count` vertices.
*/
function sampleVertexPositions(mesh, count) {
	const positions = [];
	const posAttr = mesh.geometry.attributes.position;
	if (!posAttr) return positions;
	const total = posAttr.count;
	const step = Math.max(1, Math.floor(total / count));
	for (let i = 0; i < total && positions.length < count; i += step) {
		const local = new Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
		local.applyMatrix4(mesh.matrixWorld);
		positions.push(local);
	}
	return positions;
}
function check_SKELETON_EXISTS(bones) {
	const pass = bones.length > 0;
	return {
		id: "SKELETON_EXISTS",
		pass,
		detail: pass ? `${bones.length} bones found in scene hierarchy` : "No Bone objects found — model has no skeleton"
	};
}
function check_SKELETON_HIERARCHY(bones) {
	if (bones.length === 0) return {
		id: "SKELETON_HIERARCHY",
		pass: false,
		detail: "No bones to validate hierarchy"
	};
	const rootBones = bones.filter((b) => !b.parent?.isBone);
	const orphans = bones.filter((b) => {
		return !b.parent && b !== rootBones[0];
	});
	const pass = orphans.length === 0 && rootBones.length >= 1;
	return {
		id: "SKELETON_HIERARCHY",
		pass,
		detail: pass ? `Hierarchy valid — ${rootBones.length} root bone(s), ${bones.length} total` : `Hierarchy broken — ${orphans.length} orphan bone(s), ${rootBones.length} root(s)`
	};
}
function check_INVERSE_BIND_MATRICES(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "INVERSE_BIND_MATRICES",
		pass: false,
		detail: "No SkinnedMesh found"
	};
	const broken = [];
	for (const sm of skinnedMeshes) {
		if (!sm.skeleton) {
			broken.push(`${sm.name || "unnamed"}: no skeleton`);
			continue;
		}
		if (hasNaNOrInfinity(sm.bindMatrixInverse)) broken.push(`${sm.name || "unnamed"}: NaN/Inf in bindMatrixInverse`);
		for (const bone of sm.skeleton.bones) if (hasNaNOrInfinity(bone.matrix)) {
			broken.push(`bone "${bone.name}": NaN/Inf in matrix`);
			break;
		}
	}
	const pass = broken.length === 0;
	return {
		id: "INVERSE_BIND_MATRICES",
		pass,
		detail: pass ? `All ${skinnedMeshes.length} SkinnedMesh(es) have valid bind matrices` : `Invalid bind matrices: ${broken.slice(0, 3).join("; ")}${broken.length > 3 ? ` (+${broken.length - 3} more)` : ""}`
	};
}
function check_SKINNED_MESH_SKELETON(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "SKINNED_MESH_SKELETON",
		pass: false,
		detail: "No SkinnedMesh found in scene"
	};
	const unbound = skinnedMeshes.filter((sm) => !sm.skeleton || sm.skeleton.bones.length === 0);
	const pass = unbound.length === 0;
	return {
		id: "SKINNED_MESH_SKELETON",
		pass,
		detail: pass ? `All ${skinnedMeshes.length} SkinnedMesh(es) bound to skeleton with bones` : `${unbound.length} SkinnedMesh(es) have no skeleton or empty skeleton: ${unbound.map((m) => m.name || "unnamed").slice(0, 3).join(", ")}`
	};
}
function check_SKIN_INDICES_VALID(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "SKIN_INDICES_VALID",
		pass: false,
		detail: "No SkinnedMesh found"
	};
	const missing = [];
	for (const sm of skinnedMeshes) {
		const hasSkinIndex = sm.geometry.attributes.skinIndex != null;
		const hasSkinWeight = sm.geometry.attributes.skinWeight != null;
		if (!hasSkinIndex || !hasSkinWeight) missing.push(`${sm.name || "unnamed"}: missing ${!hasSkinIndex ? "skinIndex" : ""}${!hasSkinIndex && !hasSkinWeight ? "+" : ""}${!hasSkinWeight ? "skinWeight" : ""}`);
	}
	const pass = missing.length === 0;
	return {
		id: "SKIN_INDICES_VALID",
		pass,
		detail: pass ? `skinIndex + skinWeight attributes present on all ${skinnedMeshes.length} SkinnedMesh(es)` : `Missing skin attributes: ${missing.slice(0, 3).join("; ")}`
	};
}
function check_MAX_FOUR_INFLUENCES(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "MAX_FOUR_INFLUENCES",
		pass: true,
		detail: "No SkinnedMesh — check skipped"
	};
	const violations = [];
	for (const sm of skinnedMeshes) {
		const skinIndex = sm.geometry.attributes.skinIndex;
		if (!skinIndex) continue;
		if (skinIndex.itemSize > 4) violations.push(`${sm.name || "unnamed"}: itemSize=${skinIndex.itemSize} (max 4)`);
	}
	const pass = violations.length === 0;
	return {
		id: "MAX_FOUR_INFLUENCES",
		pass,
		detail: pass ? `All SkinnedMesh(es) within 4-influence WebGL limit` : `Influence count violations: ${violations.slice(0, 3).join("; ")}`
	};
}
function check_WEIGHTS_SUM_TO_ONE(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "WEIGHTS_SUM_TO_ONE",
		pass: true,
		detail: "No SkinnedMesh — check skipped"
	};
	let totalSampled = 0;
	let totalViolations = 0;
	for (const sm of skinnedMeshes) {
		const weightAttr = sm.geometry.attributes.skinWeight;
		if (!weightAttr) continue;
		const count = weightAttr.count;
		const step = Math.max(1, Math.floor(count / SAMPLE_VERTEX_COUNT));
		for (let i = 0; i < count; i += step) {
			totalSampled++;
			let sum = 0;
			for (let j = 0; j < weightAttr.itemSize; j++) sum += weightAttr.getComponent(i, j);
			if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE && sum > .01) totalViolations++;
		}
	}
	const pass = totalViolations === 0;
	return {
		id: "WEIGHTS_SUM_TO_ONE",
		pass,
		detail: pass ? `Weight sums valid across ${totalSampled} sampled vertices (tolerance ±${WEIGHT_SUM_TOLERANCE})` : `${totalViolations}/${totalSampled} sampled vertices have weights not summing to 1.0`
	};
}
function check_BIND_POSE_STABLE(bones, skinnedMeshes) {
	const badBones = [];
	for (const bone of bones) {
		bone.updateWorldMatrix(true, false);
		if (hasNaNOrInfinity(bone.matrixWorld)) badBones.push(bone.name || "unnamed");
	}
	for (const sm of skinnedMeshes) if (hasNaNOrInfinity(sm.matrixWorld)) badBones.push(`mesh:${sm.name || "unnamed"}`);
	const pass = badBones.length === 0;
	return {
		id: "BIND_POSE_STABLE",
		pass,
		detail: pass ? `All bone/mesh world matrices are finite` : `NaN/Infinity in world matrices: ${badBones.slice(0, 5).join(", ")}`
	};
}
function check_FLOOR_NORMALIZATION(scene) {
	scene.updateMatrixWorld(true);
	const box = new Box3().setFromObject(scene);
	if (box.isEmpty()) return {
		id: "FLOOR_NORMALIZATION",
		pass: false,
		detail: "Bounding box is empty — no geometry found"
	};
	const minY = box.min.y;
	const pass = Math.abs(minY) <= FLOOR_Y_TOLERANCE;
	return {
		id: "FLOOR_NORMALIZATION",
		pass,
		detail: pass ? `Floor at Y=${minY.toFixed(4)} (within ±${FLOOR_Y_TOLERANCE} tolerance)` : `Floor at Y=${minY.toFixed(4)} — character not floor-normalized (expected ~0)`
	};
}
function check_FORWARD_DIRECTION(forwardCorrectionY) {
	return {
		id: "FORWARD_DIRECTION",
		pass: true,
		detail: `Forward correction applied: ${Math.round(forwardCorrectionY * 180 / Math.PI)}° (0°=already correct, 180°=+Z export corrected)`
	};
}
function check_FRUSTUM_CULLING_DISABLED(skinnedMeshes) {
	if (skinnedMeshes.length === 0) return {
		id: "FRUSTUM_CULLING_DISABLED",
		pass: true,
		detail: "No SkinnedMesh — check skipped"
	};
	const cullingEnabled = skinnedMeshes.filter((sm) => sm.frustumCulled);
	const pass = cullingEnabled.length === 0;
	return {
		id: "FRUSTUM_CULLING_DISABLED",
		pass,
		detail: pass ? `frustumCulled=false on all ${skinnedMeshes.length} SkinnedMesh(es)` : `${cullingEnabled.length} SkinnedMesh(es) still have frustumCulled=true — body parts may disappear during attacks`
	};
}
function check_MIXER_TARGETS_CLONE(mixer, clonedScene) {
	const mixerRoot = mixer._root;
	const pass = mixerRoot != null && mixerRoot.uuid === clonedScene.uuid;
	return {
		id: "MIXER_TARGETS_CLONE",
		pass,
		detail: pass ? `AnimationMixer root matches cloned scene (uuid=${clonedScene.uuid.slice(0, 8)})` : `AnimationMixer root MISMATCH — mixer uuid=${mixerRoot?.uuid?.slice(0, 8) ?? "null"} vs clone uuid=${clonedScene.uuid.slice(0, 8)}`
	};
}
function check_ANIMATION_CLIPS_EXIST(actions) {
	const clipCount = Object.keys(actions).length;
	const pass = clipCount > 0;
	return {
		id: "ANIMATION_CLIPS_EXIST",
		pass,
		detail: pass ? `${clipCount} AnimationAction(s) registered: [${Object.keys(actions).slice(0, 5).join(", ")}${clipCount > 5 ? "..." : ""}]` : "No AnimationActions registered on mixer — character cannot animate"
	};
}
/**
* CHECK 14: FIRST_FRAME_DISPLACEMENT
*
* Non-destructive first-frame deformation test.
* Samples vertex positions BEFORE and AFTER a single mixer tick (1/60s).
* Resets mixer time to 0 after the test so combat starts from the correct frame.
*
* AGENT LAW: This test MUST NOT leave the mixer in a dirty state.
* We save/restore mixer time and stop all actions after the test.
* The caller is responsible for re-starting the idle action after this check.
*
* STATIC MESH EXCEPTION: If no SkinnedMesh with a valid skeleton is found,
* we return pass:false WITHOUT calling stopAllAction() or setTime(0).
* Stopping the mixer on a static-mesh GLB kills any running idle animation
* and the recovery path cannot restart it — causing the statue/bind-pose lock.
*/
function check_FIRST_FRAME_DISPLACEMENT(mixer, actions, skinnedMeshes, clonedScene) {
	if (skinnedMeshes.length === 0) return {
		id: "FIRST_FRAME_DISPLACEMENT",
		pass: false,
		detail: "No SkinnedMesh — static mesh asset, skeletal deformation not possible (mixer not disrupted)"
	};
	const clipNames = Object.keys(actions);
	if (clipNames.length === 0) return {
		id: "FIRST_FRAME_DISPLACEMENT",
		pass: false,
		detail: "No animation clips — cannot test displacement"
	};
	const testClipName = clipNames.find((n) => n.toLowerCase().includes("idle")) ?? clipNames[0];
	const testAction = actions[testClipName];
	if (!testAction) return {
		id: "FIRST_FRAME_DISPLACEMENT",
		pass: false,
		detail: `Test action "${testClipName}" not found`
	};
	const testMesh = skinnedMeshes.find((sm) => sm.skeleton && sm.skeleton.bones.length > 0 && sm.geometry.attributes.position && sm.geometry.attributes.skinWeight);
	if (!testMesh) return {
		id: "FIRST_FRAME_DISPLACEMENT",
		pass: false,
		detail: "No valid SkinnedMesh with skeleton + skinWeight for displacement test (mixer not disrupted)"
	};
	clonedScene.updateMatrixWorld(true);
	const before = sampleVertexPositions(testMesh, SAMPLE_VERTEX_COUNT);
	const savedTimeScale = mixer.timeScale;
	mixer.timeScale = 1;
	testAction.reset();
	testAction.setLoop(LoopOnce, 1);
	testAction.play();
	mixer.update(1 / 60);
	clonedScene.updateMatrixWorld(true);
	const after = sampleVertexPositions(testMesh, SAMPLE_VERTEX_COUNT);
	mixer.stopAllAction();
	mixer.setTime(0);
	mixer.timeScale = savedTimeScale;
	let maxDisplacement = 0;
	const sampleCount = Math.min(before.length, after.length);
	for (let i = 0; i < sampleCount; i++) {
		const d = before[i].distanceTo(after[i]);
		if (d > maxDisplacement) maxDisplacement = d;
	}
	const pass = maxDisplacement >= MIN_VERTEX_DISPLACEMENT;
	return {
		id: "FIRST_FRAME_DISPLACEMENT",
		pass,
		detail: pass ? `Visible mesh deformation confirmed — max vertex displacement: ${maxDisplacement.toFixed(5)} units (clip: "${testClipName}")` : `NO visible mesh deformation — max displacement: ${maxDisplacement.toFixed(5)} units. Animation is on invisible skeleton, not visible mesh.`
	};
}
/**
* runDeformationIntegrityTest
*
* Runs the full 14-point deformation integrity test on a fighter's normalized
* scene at combat entry.
*
* Returns a DeformationIntegrityReport with:
*   - verdict: 'PASS' | 'BLOCKED'
*   - checks: all 14 check results
*   - failingChecks: IDs of failed checks
*
* If verdict is 'BLOCKED', the caller MUST freeze combat.
*
* AGENT LAW: This function is read-only. It never modifies the scene.
* Exception: CHECK 14 (FIRST_FRAME_DISPLACEMENT) temporarily ticks the mixer
* and immediately resets it — the caller must re-start idle after this call.
*/
function runDeformationIntegrityTest(input) {
	const { characterName, modelUrl, clonedScene, mixer, actions, forwardCorrectionY } = input;
	const bones = collectBones(clonedScene);
	const skinnedMeshes = collectSkinnedMeshes(clonedScene);
	const checks = [
		check_SKELETON_EXISTS(bones),
		check_SKELETON_HIERARCHY(bones),
		check_INVERSE_BIND_MATRICES(skinnedMeshes),
		check_SKINNED_MESH_SKELETON(skinnedMeshes),
		check_SKIN_INDICES_VALID(skinnedMeshes),
		check_MAX_FOUR_INFLUENCES(skinnedMeshes),
		check_WEIGHTS_SUM_TO_ONE(skinnedMeshes),
		check_BIND_POSE_STABLE(bones, skinnedMeshes),
		check_FLOOR_NORMALIZATION(clonedScene),
		check_FORWARD_DIRECTION(forwardCorrectionY),
		check_FRUSTUM_CULLING_DISABLED(skinnedMeshes),
		check_MIXER_TARGETS_CLONE(mixer, clonedScene),
		check_ANIMATION_CLIPS_EXIST(actions),
		check_FIRST_FRAME_DISPLACEMENT(mixer, actions, skinnedMeshes, clonedScene)
	];
	const failingChecks = checks.filter((c) => !c.pass).map((c) => c.id);
	const verdict = failingChecks.length === 0 ? "PASS" : "BLOCKED";
	const report = {
		characterName,
		modelUrl,
		verdict,
		checks,
		failingChecks,
		timestamp: Date.now()
	};
	console.group(`${verdict === "PASS" ? `[DeformationIntegrity] ✅ PASS` : `[DeformationIntegrity] ❌ BLOCKED`} — ${characterName} (${modelUrl.split("/").pop()})`);
	console.log(`Verdict: ${verdict} | Checks: ${checks.length - failingChecks.length}/${checks.length} passed`);
	for (const check of checks) {
		const icon = check.pass ? "  ✓" : "  ✗";
		const level = check.pass ? "log" : "warn";
		console[level](`${icon} [${check.id}] ${check.detail}`);
	}
	if (verdict === "BLOCKED") console.error(`[DeformationIntegrity] COMBAT FROZEN — ${characterName} failed: [${failingChecks.join(", ")}]`);
	console.groupEnd();
	return report;
}
var AnimationBridge = class {
	characterId;
	retargeter;
	constructor(characterId) {
		this.characterId = characterId;
		this.retargeter = new AnimationRetargeter(`${characterId}_source`, `${characterId}_target`);
	}
	/**
	* Build the animation bridge for a character.
	*
	* @param sourceScene   Source skeleton scene (animation source)
	* @param targetScene   Target skeleton scene (visible clone)
	* @param sourceClips   Animation clips from the source
	* @returns AnimationBridgeResult with clips keyed by semantic state
	*/
	build(sourceScene, targetScene, sourceClips) {
		const retargetReport = this.retargeter.buildMap(sourceScene, targetScene);
		const { clips: retargetedClips, totalResolved, totalUnresolved } = this.retargeter.retargetClips(sourceClips, this.characterId);
		validateAnimationChannelBones(targetScene, retargetedClips, this.characterId);
		const clipsByState = /* @__PURE__ */ new Map();
		const missingStates = [];
		for (const [semanticState, aliases] of Object.entries(SEMANTIC_STATE_ALIASES)) {
			let found = false;
			for (const alias of aliases) {
				const clip = retargetedClips.find((c) => c.name === alias || c.name.toLowerCase() === alias.toLowerCase());
				if (clip) {
					clipsByState.set(semanticState, clip);
					found = true;
					break;
				}
			}
			if (!found) {
				missingStates.push(semanticState);
				console.warn(`[AnimationBridge] ⚠️ MISSING_CLIP: "${this.characterId}" has no clip for semantic state "${semanticState}"\n  Tried aliases: ${aliases.slice(0, 5).join(", ")}${aliases.length > 5 ? ` +${aliases.length - 5} more` : ""}`);
			}
		}
		if (missingStates.length > 0) console.warn(`[AnimationBridge] ⚠️ "${this.characterId}" missing ${missingStates.length} semantic state(s): ` + missingStates.join(", "));
		return {
			clipsByState,
			allClips: retargetedClips,
			missingStates,
			retargetReport,
			resolvedTrackCount: totalResolved,
			unresolvedTrackCount: totalUnresolved
		};
	}
	/**
	* Feed retargeted clips to an AnimationMixer.
	* The mixer MUST target the visible SkeletonUtils.clone() instance.
	*
	* Pipeline:
	*   source animation → normalize names → canonical mapping → retarget to target skeleton
	*   → validate track paths → AnimationMixer(visibleClone) → clipAction() → .play()
	*   → mixer.update(delta)
	*
	* @param mixer       AnimationMixer rooted on the visible clone
	* @param targetScene The visible clone (must match mixer root)
	* @param clips       Retargeted clips from build()
	* @returns Actions map: clip name → AnimationAction
	*/
	feedToMixer(mixer, targetScene, clips) {
		const actions = {};
		for (const clip of clips) {
			const action = mixer.clipAction(clip, targetScene);
			actions[clip.name] = action;
		}
		console.log(`[AnimationBridge] 🎬 "${this.characterId}" fed ${clips.length} clip(s) to mixer.\n  Mixer root: ${mixer._root?.uuid ?? "unknown"}\n  Actions: [${Object.keys(actions).join(", ")}]`);
		return actions;
	}
	/**
	* Resolve a FighterStateMachine combat state to a semantic animation state.
	* Returns null when the combat state has no mapping — never invents idle.
	*/
	static resolveSemanticState(combatState) {
		return COMBAT_STATE_TO_SEMANTIC[combatState] ?? null;
	}
	/**
	* Get the best clip for a combat state from a clips-by-state map.
	* Required combat states (attack/block/hit/knockdown/getup/walk) do NOT
	* silently fall back to idle. MISSING_CLIP stays MISSING_CLIP.
	*/
	static getClipForCombatState(combatState, clipsByState) {
		const semanticState = COMBAT_STATE_TO_SEMANTIC[combatState];
		if (!semanticState) return null;
		const direct = clipsByState.get(semanticState);
		if (direct) {
			if ((direct.userData?.isProcedural === true || direct.userData?.clipSourceType === "PLACEHOLDER_TEST_CLIP") && semanticState !== "idle") {
				console.warn(`[AnimationBridge] ⚠️ PLACEHOLDER_TEST_CLIP for "${semanticState}" is TEST_ONLY — treating as MISSING_CLIP`);
				return null;
			}
			return direct;
		}
		const chain = {
			walk_back: ["walk_forward"],
			strafe_left: ["walk_forward"],
			strafe_right: ["walk_forward"],
			backdash: ["walk_back", "walk_forward"],
			run: ["walk_forward"]
		}[semanticState] ?? [];
		for (const fb of chain) {
			const fbClip = clipsByState.get(fb);
			if (fbClip && fbClip.userData?.isProcedural !== true) return fbClip;
		}
		console.warn(`[AnimationBridge] ⚠️ MISSING_CLIP: combatState="${combatState}" semantic="${semanticState}" — no authored clip`);
		return null;
	}
};
var ANIMATION_ALIASES = {
	idle: [
		"idle",
		"Idle",
		"neutral",
		"Neutral",
		"standing",
		"Standing",
		"stance",
		"Stance",
		"bind",
		"T-pose",
		"TPose",
		"tpose",
		"rest",
		"Rest",
		"combatIdle",
		"CombatIdle",
		"fightingStance",
		"FightingStance",
		"readyStance",
		"ReadyStance"
	],
	Neutral: [
		"idle",
		"Idle",
		"neutral",
		"Neutral",
		"standing",
		"Standing",
		"stance",
		"Stance"
	],
	walk: [
		"walk",
		"Walk",
		"walking",
		"Walking",
		"run",
		"Run",
		"walkForward",
		"WalkForward",
		"walk_fwd",
		"SBW_walk_fwd",
		"T_walk_fwd",
		"bf_walk_fwd"
	],
	Walking: [
		"walk",
		"Walk",
		"walking",
		"Walking",
		"run",
		"Run",
		"walkForward",
		"WalkForward"
	],
	walkForward: [
		"walkForward",
		"WalkForward",
		"walk",
		"Walk",
		"walking",
		"Walking",
		"forward",
		"Forward",
		"run",
		"Run",
		"walk_fwd",
		"walk_forward",
		"SBW_walk_fwd",
		"T_walk_fwd",
		"bf_walk_fwd",
		"advance",
		"approach",
		"movingForward"
	],
	walkBackward: [
		"walkBack",
		"WalkBack",
		"walkBackward",
		"WalkBackward",
		"walk",
		"Walk",
		"backward",
		"Backward",
		"retreat",
		"Retreat",
		"walk_back",
		"walk_bwd",
		"SBW_walk_back",
		"T_walk_back",
		"bf_walk_back",
		"movingBackward"
	],
	strafeLeft: [
		"strafeLeft",
		"StrafeLeft",
		"sidestepLeft",
		"SidestepLeft",
		"walk",
		"Walk",
		"moveLeft",
		"MoveLeft",
		"stepLeft",
		"StepLeft",
		"SBW_strafe_left",
		"T_sidestep_left"
	],
	strafeRight: [
		"strafeRight",
		"StrafeRight",
		"sidestepRight",
		"SidestepRight",
		"walk",
		"Walk",
		"moveRight",
		"MoveRight",
		"stepRight",
		"StepRight",
		"SBW_strafe_right",
		"T_sidestep_right"
	],
	sidestepLeft: [
		"sidestepLeft",
		"SidestepLeft",
		"strafeLeft",
		"StrafeLeft",
		"T_sidestep_left",
		"T_ssl"
	],
	sidestepRight: [
		"sidestepRight",
		"SidestepRight",
		"strafeRight",
		"StrafeRight",
		"T_sidestep_right",
		"T_ssr"
	],
	Backdashing: [
		"backdash",
		"Backdash",
		"backDash",
		"BackDash",
		"walkBack",
		"WalkBack",
		"walkBackward",
		"WalkBackward",
		"walk",
		"Walk",
		"backstep",
		"Backstep",
		"quickRetreat",
		"QuickRetreat",
		"SBW_backdash",
		"T_backdash"
	],
	crouch: [
		"crouch",
		"Crouch",
		"duck",
		"Duck",
		"lowStance",
		"LowStance",
		"crouching",
		"Crouching",
		"crouchStance",
		"CrouchStance",
		"lowGuard",
		"LowGuard",
		"SBW_crouch",
		"T_crouch",
		"bf_crouch"
	],
	crouchWalk: [
		"crouchWalk",
		"CrouchWalk",
		"crouchForward",
		"CrouchForward",
		"crouch",
		"Crouch"
	],
	guard: [
		"guard",
		"Guard",
		"block",
		"Block",
		"defend",
		"Defend",
		"parry",
		"Parry",
		"blocking",
		"Blocking",
		"highBlock",
		"HighBlock",
		"standingBlock",
		"StandingBlock",
		"SBW_guard",
		"T_guard",
		"bf_guard"
	],
	Guard: [
		"guard",
		"Guard",
		"block",
		"Block",
		"defend",
		"Defend"
	],
	Blockstun: [
		"block",
		"Block",
		"guard",
		"Guard",
		"blockstun",
		"Blockstun"
	],
	guardLow: [
		"guardLow",
		"GuardLow",
		"lowBlock",
		"LowBlock",
		"crouchBlock",
		"CrouchBlock",
		"guard",
		"Guard",
		"block",
		"Block"
	],
	light: [
		"light",
		"Light",
		"punch",
		"Punch",
		"attack",
		"Attack",
		"jab",
		"Jab",
		"lightAttack",
		"LightAttack",
		"LP",
		"lp"
	],
	lightAttack: [
		"lightAttack",
		"LightAttack",
		"light",
		"Light",
		"punch",
		"Punch",
		"jab",
		"Jab",
		"attack",
		"Attack",
		"hit",
		"Hit",
		"strike",
		"Strike",
		"quickPunch",
		"QuickPunch",
		"punch1",
		"Punch1",
		"LP",
		"lp",
		"SBW_lightAttack",
		"SBW_jab",
		"T_jab",
		"T_1",
		"bf_jab",
		"bf_chop",
		"punchingLeft",
		"punchingRight"
	],
	Startup: [
		"lightAttack",
		"LightAttack",
		"attack",
		"Attack",
		"punch",
		"Punch",
		"jab",
		"Jab"
	],
	Active: [
		"lightAttack",
		"LightAttack",
		"attack",
		"Attack",
		"punch",
		"Punch",
		"kick",
		"Kick"
	],
	crouchLightAttack: [
		"crouchLightAttack",
		"CrouchLightAttack",
		"crouchPunch",
		"CrouchPunch",
		"lowPunch",
		"LowPunch",
		"lightAttack",
		"LightAttack",
		"jab",
		"Jab"
	],
	heavy: [
		"heavy",
		"Heavy",
		"strong",
		"Strong",
		"heavyAttack",
		"HeavyAttack",
		"cross",
		"Cross"
	],
	heavyAttack: [
		"heavyAttack",
		"HeavyAttack",
		"heavy",
		"Heavy",
		"strong",
		"Strong",
		"cross",
		"Cross",
		"kick",
		"Kick",
		"attack",
		"Attack",
		"strike",
		"Strike",
		"hook",
		"Hook",
		"uppercut",
		"Uppercut",
		"roundhouse",
		"Roundhouse",
		"highKick",
		"HighKick",
		"spinningKick",
		"SpinningKick",
		"RP",
		"rp",
		"LK",
		"lk",
		"RK",
		"rk",
		"SBW_heavyAttack",
		"SBW_cross",
		"T_cross",
		"T_2",
		"T_3",
		"T_4",
		"bf_cross",
		"bf_elbow",
		"bf_uppercut",
		"kickingLeft",
		"kickingRight",
		"kickingForward"
	],
	crouchHeavyAttack: [
		"crouchHeavyAttack",
		"CrouchHeavyAttack",
		"crouchKick",
		"CrouchKick",
		"lowKick",
		"LowKick",
		"heavyAttack",
		"HeavyAttack",
		"kick",
		"Kick"
	],
	jumpAttack: [
		"jumpAttack",
		"JumpAttack",
		"airAttack",
		"AirAttack",
		"jumpingPunch",
		"JumpingPunch",
		"heavyAttack",
		"HeavyAttack"
	],
	runAttack: [
		"runAttack",
		"RunAttack",
		"dashAttack",
		"DashAttack",
		"runningAttack",
		"RunningAttack",
		"heavyAttack",
		"HeavyAttack"
	],
	heatBurst: [
		"heatBurst",
		"HeatBurst",
		"heat_burst",
		"Heat_Burst",
		"heavyAttack",
		"HeavyAttack",
		"special",
		"Special"
	],
	rageArt: [
		"rageArt",
		"RageArt",
		"rage_art",
		"Rage_Art",
		"finisher",
		"Finisher",
		"heavyAttack",
		"HeavyAttack"
	],
	powerCrush: [
		"powerCrush",
		"PowerCrush",
		"power_crush",
		"armorMove",
		"ArmorMove",
		"heavyAttack",
		"HeavyAttack"
	],
	CommandThrow: [
		"heavyAttack",
		"HeavyAttack",
		"heavy",
		"Heavy",
		"grab",
		"Grab",
		"throw",
		"Throw",
		"grapple",
		"Grapple",
		"suplex",
		"Suplex",
		"slam",
		"Slam",
		"SBW_throw",
		"T_1_3",
		"T_2_4",
		"bf_grab",
		"bf_beastMode"
	],
	ThrowWhiff: [
		"idle",
		"Idle",
		"neutral",
		"Neutral"
	],
	hit: [
		"hit",
		"Hit",
		"hurt",
		"Hurt",
		"flinch",
		"Flinch",
		"hitstun",
		"Hitstun",
		"damage",
		"Damage",
		"react",
		"React",
		"stagger",
		"Stagger",
		"recoil",
		"Recoil",
		"SBW_hit",
		"T_hit",
		"bf_hit_reaction",
		"gettingHit",
		"hitImpact"
	],
	Hitstun: [
		"hit",
		"Hit",
		"hurt",
		"Hurt",
		"flinch",
		"Flinch",
		"damage",
		"Damage",
		"hitstun",
		"Hitstun"
	],
	HitStun: [
		"hit",
		"Hit",
		"hurt",
		"Hurt",
		"flinch",
		"Flinch",
		"damage",
		"Damage"
	],
	Stunned: [
		"hit",
		"Hit",
		"hurt",
		"Hurt",
		"flinch",
		"Flinch",
		"damage",
		"Damage"
	],
	hitLow: [
		"hitLow",
		"HitLow",
		"lowHit",
		"LowHit",
		"hit",
		"Hit",
		"hurt",
		"Hurt"
	],
	hitHigh: [
		"hitHigh",
		"HitHigh",
		"highHit",
		"HighHit",
		"hit",
		"Hit",
		"hurt",
		"Hurt"
	],
	knockdown: [
		"knockdown",
		"Knockdown",
		"ko",
		"KO",
		"knockout",
		"Knockout",
		"death",
		"Death",
		"fall",
		"Fall",
		"down",
		"Down",
		"fallingBack",
		"FallingBack",
		"fallingForward",
		"FallingForward",
		"knockedDown",
		"KnockedDown",
		"SBW_knockdown",
		"T_knockdown",
		"bf_knockdown",
		"bf_hard_knockdown"
	],
	Knockdown: [
		"knockdown",
		"Knockdown",
		"ko",
		"KO",
		"fall",
		"Fall",
		"down",
		"Down"
	],
	ko: [
		"ko",
		"KO",
		"knockout",
		"Knockout",
		"death",
		"Death",
		"fall",
		"Fall",
		"knockdown",
		"Knockdown"
	],
	KO: [
		"ko",
		"KO",
		"knockout",
		"Knockout",
		"death",
		"Death",
		"fall",
		"Fall",
		"knockdown",
		"Knockdown"
	],
	Crumple: [
		"ko",
		"KO",
		"knockdown",
		"Knockdown",
		"fall",
		"Fall",
		"death",
		"Death",
		"crumple",
		"Crumple"
	],
	WakeupTechRoll: [
		"techRoll",
		"TechRoll",
		"roll",
		"Roll",
		"rollForward",
		"RollForward",
		"forwardRoll",
		"ForwardRoll",
		"walkForward",
		"WalkForward",
		"walk",
		"Walk",
		"SBW_techroll",
		"T_techroll"
	],
	WakeupBackrise: [
		"backrise",
		"Backrise",
		"getUp",
		"GetUp",
		"rollBack",
		"RollBack",
		"walkBackward",
		"WalkBackward",
		"walk",
		"Walk",
		"T_backrise"
	],
	WakeupQuickStand: [
		"quickStand",
		"QuickStand",
		"getUp",
		"GetUp",
		"gettingUp",
		"GettingUp",
		"idle",
		"Idle",
		"standing",
		"Standing",
		"T_quickstand"
	],
	victory: [
		"victory",
		"Victory",
		"win",
		"Win",
		"celebrate",
		"Celebrate",
		"taunt_win",
		"TauntWin",
		"victoryPose",
		"VictoryPose",
		"winPose",
		"WinPose"
	],
	defeat: [
		"defeat",
		"Defeat",
		"lose",
		"Lose",
		"knockdown",
		"Knockdown",
		"ko",
		"KO",
		"fall",
		"Fall"
	],
	taunt: [
		"taunt",
		"Taunt",
		"idle",
		"Idle",
		"victory",
		"Victory"
	],
	intro: [
		"intro",
		"Intro",
		"entrance",
		"Entrance",
		"idle",
		"Idle"
	],
	run: [
		"run",
		"Run",
		"running",
		"Running",
		"sprint",
		"Sprint",
		"dash",
		"Dash",
		"walkForward",
		"WalkForward",
		"walk",
		"Walk"
	],
	dash: [
		"dash",
		"Dash",
		"dashForward",
		"DashForward",
		"run",
		"Run",
		"walkForward",
		"WalkForward"
	],
	dashForward: [
		"dashForward",
		"DashForward",
		"dash",
		"Dash",
		"run",
		"Run",
		"walkForward",
		"WalkForward"
	]
};
var FADE_DURATIONS = {
	idle: .1,
	Neutral: .1,
	walk: .1,
	walkForward: .1,
	walkBackward: .1,
	Walking: .1,
	strafeLeft: .1,
	strafeRight: .1,
	Backdashing: .067,
	WakeupTechRoll: .083,
	WakeupBackrise: .083,
	WakeupQuickStand: .067,
	light: .05,
	lightAttack: .05,
	Startup: .05,
	Active: .033,
	heavy: .067,
	heavyAttack: .067,
	CommandThrow: .067,
	hit: .033,
	Hitstun: .033,
	HitStun: .033,
	Stunned: .033,
	knockdown: .067,
	Knockdown: .067,
	ko: .067,
	KO: .067,
	Crumple: .067,
	guard: .083,
	Guard: .083,
	block: .083,
	Blockstun: .083,
	ThrowWhiff: .083
};
var DEFAULT_FADE = .083;
var LOOP_STATES = /* @__PURE__ */ new Set([
	"idle",
	"Neutral",
	"walk",
	"walkForward",
	"walkBackward",
	"Walking",
	"strafeLeft",
	"strafeRight",
	"guard",
	"Guard",
	"block",
	"Blockstun",
	"Knockdown",
	"WakeupTechRoll",
	"WakeupBackrise",
	"WakeupQuickStand",
	"Backdashing"
]);
var ATTACK_STATES = /* @__PURE__ */ new Set([
	"lightAttack",
	"heavyAttack",
	"light",
	"heavy",
	"Startup",
	"Active",
	"CommandThrow"
]);
var VELOCITY_ANIM_THRESHOLD = .12;
/**
* Minimum time (seconds) a crossfade must be held before another can begin.
* Prevents rapid state oscillation (walk→idle→walk in <3 frames) from
* stacking crossfades and causing visual jitter.
*/
var MIN_CROSSFADE_HOLD_S = .05;
function buildClipsByState(actions) {
	const clipsByState = /* @__PURE__ */ new Map();
	for (const [name, action] of Object.entries(actions)) {
		const clip = action.getClip();
		const semantic = clip.userData?.semanticState ?? inferSemanticStateFromClipName(clip.name || name) ?? inferSemanticStateFromClipName(name);
		if (semantic && !clipsByState.has(semantic)) clipsByState.set(semantic, clip);
	}
	return clipsByState;
}
function resolveClipName(key, actions) {
	const availableClips = Object.keys(actions);
	const clipsByState = buildClipsByState(actions);
	const bridged = AnimationBridge.getClipForCombatState(key, clipsByState);
	if (bridged) {
		const clipName = Object.keys(actions).find((n) => actions[n].getClip() === bridged) ?? bridged.name;
		console.log(`[FighterMesh] 🗺️ AnimationBridge resolve: combatState="${key}" → semantic="${COMBAT_STATE_TO_SEMANTIC[key]}" → clip="${clipName}"`);
		return clipName;
	}
	const semanticState = COMBAT_STATE_TO_SEMANTIC[key];
	if (semanticState) {
		const aliases = SEMANTIC_STATE_ALIASES[semanticState] ?? [semanticState];
		const semanticFound = availableClips.find((c) => aliases.some((a) => c.toLowerCase() === a.toLowerCase()));
		if (semanticFound) {
			console.log(`[FighterMesh] 🗺️ AnimationBridge alias: combatState="${key}" → semantic="${semanticState}" → clip="${semanticFound}"`);
			return semanticFound;
		}
		console.warn(`[FighterMesh] ⚠️ MISSING_CLIP: combatState="${key}" → semantic="${semanticState}" — no matching clip in [${availableClips.slice(0, 4).join(", ")}${availableClips.length > 4 ? "..." : ""}]`);
		if (semanticState !== "idle") return null;
	}
	const aliases = ANIMATION_ALIASES[key] ?? [key];
	let found = availableClips.find((c) => aliases.some((a) => c.toLowerCase() === a.toLowerCase()));
	if (found) return found;
	if (key === "idle" || key === "Neutral") {
		found = availableClips.find((c) => c.toLowerCase().includes("idle"));
		if (found) return found;
	}
	return null;
}
async function normalizeGLB(scene, animations, gltfUrl, _report) {
	const result = await runCharacterPipeline(scene, animations, gltfUrl, true);
	if (!result) {
		console.error(`[FighterMesh] 🚫 BLOCKED — "${gltfUrl.split("/").pop()}" failed CharacterPipeline validation. Combat entry blocked. Fix the source GLB asset.`);
		return null;
	}
	return {
		scene: result.scene,
		forwardCorrectionY: result.forwardCorrectionY,
		mixer: result.mixer,
		actions: result.actions,
		skeletonHelper: result.skeletonHelper
	};
}
function FighterMeshInner({ gltfUrl, state, animation, position, facing, rotationY = 0, tint, showHitbox = false, hitboxGeometry = null, animationTrigger = 0, locomotionVelocity, hitStopActive = false, onRigDiagnostic, onBoneHitboxReady, onDeformationBlocked, onAnimationIntegrityReport }) {
	const groupRef = (0, import_react.useRef)(null);
	const [normalized, setNormalized] = (0, import_react.useState)(null);
	/** The clip name that is currently playing (or crossfading to) */
	const activeClipRef = (0, import_react.useRef)(null);
	/** Timestamp of the last crossfade start — enforces MIN_CROSSFADE_HOLD_S */
	const lastCrossfadeTimeRef = (0, import_react.useRef)(0);
	/** The resolved clip name of the last state we committed to */
	const committedClipRef = (0, import_react.useRef)(null);
	const boneHitboxRef = (0, import_react.useRef)(new BoneHitboxSystem());
	const activeAttackKeyRef = (0, import_react.useRef)(null);
	const combatEntryCheckedRef = (0, import_react.useRef)(false);
	/**
	* Set to true if the deformation integrity test PASSED.
	* Set to false if BLOCKED — CombatArena3D should freeze combat.
	* Exposed via onDeformationBlocked callback if provided.
	*/
	const deformationPassedRef = (0, import_react.useRef)(true);
	const { scene, animations } = useGLTF(gltfUrl, true, true);
	(0, import_react.useEffect)(() => {
		if (!scene) return;
		const report = AutoRigDetector.analyze(scene, animations);
		onRigDiagnostic?.(report);
		let cancelled = false;
		normalizeGLB(scene, animations, gltfUrl, report).then((result) => {
			if (cancelled) return;
			if (!result) {
				const characterName = gltfUrl.split("/").pop()?.replace(".glb", "") ?? gltfUrl;
				console.error(`[FighterMesh] 🚫 BLOCKED — "${characterName}" failed CharacterPipeline validation. ASSET DEFORMATION INTEGRITY FAILURE. Fix the source GLB.`);
				onDeformationBlocked?.(characterName, ["PIPELINE_VALIDATION_FAILED"]);
				return;
			}
			result.scene.updateMatrixWorld(true);
			boneHitboxRef.current.initFromSkeleton(result.scene);
			onBoneHitboxReady?.(boneHitboxRef.current);
			setNormalized(result);
		});
		return () => {
			cancelled = true;
		};
	}, [scene, gltfUrl]);
	(0, import_react.useEffect)(() => {
		if (!normalized) return;
		const { actions, mixer } = normalized;
		const availableClips = Object.keys(actions);
		if (availableClips.length === 0) {
			console.warn(`[FighterMesh] ⚠️ No animation clips available for "${gltfUrl.split("/").pop()}"`);
			return;
		}
		const inputKey = animation ?? state;
		const clipName = resolveClipName(inputKey, actions);
		if ([
			"walkForward",
			"walkBackward",
			"strafeLeft",
			"strafeRight",
			"Walking",
			"walk"
		].includes(inputKey) && locomotionVelocity) {
			if (Math.sqrt(locomotionVelocity.forward * locomotionVelocity.forward + locomotionVelocity.strafe * locomotionVelocity.strafe) < VELOCITY_ANIM_THRESHOLD) return;
		}
		const isAttack = ATTACK_STATES.has(inputKey);
		if (isAttack) {
			if (ATTACK_ROOT_MOTION_PROFILES[inputKey]?.hasRootMotion) {
				activeAttackKeyRef.current = inputKey;
				boneHitboxRef.current.activateAttack(inputKey);
			} else activeAttackKeyRef.current = null;
		} else if (activeAttackKeyRef.current) {
			boneHitboxRef.current.deactivateAll();
			activeAttackKeyRef.current = null;
		}
		console.log(`[FighterMesh] 🎬 input="${inputKey}" → clip="${clipName ?? "NONE"}" (trigger=${animationTrigger}) vel={fwd=${locomotionVelocity?.forward?.toFixed(2) ?? "?"},str=${locomotionVelocity?.strafe?.toFixed(2) ?? "?"}}`);
		if (inputKey !== "idle" && inputKey !== "Neutral" && inputKey !== "bind" && !combatEntryCheckedRef.current && normalized) {
			combatEntryCheckedRef.current = true;
			const integrityInput = {
				characterName: gltfUrl.split("/").pop()?.replace(".glb", "") ?? gltfUrl,
				modelUrl: gltfUrl,
				clonedScene: normalized.scene,
				mixer: normalized.mixer,
				actions: normalized.actions,
				forwardCorrectionY: normalized.forwardCorrectionY
			};
			const report = runDeformationIntegrityTest(integrityInput);
			const animIntegrityReport = runAnimationIntegrityGate({
				characterName: integrityInput.characterName.toUpperCase(),
				clonedScene: normalized.scene,
				mixer: normalized.mixer,
				actions: normalized.actions,
				activeClipName: activeClipRef.current
			});
			onAnimationIntegrityReport?.(animIntegrityReport);
			if (report.verdict === "BLOCKED") {
				if (report.failingChecks.includes("NO_VISIBLE_MESH")) {
					console.error(`[FighterMesh] 🚫 COMBAT FROZEN — ${integrityInput.characterName} has NO_VISIBLE_MESH: nothing to render. Fix the GLB asset.`);
					onDeformationBlocked?.(integrityInput.characterName, report.failingChecks);
					return;
				}
				console.warn(`[FighterMesh] ⚠️ Deformation integrity warnings for ${integrityInput.characterName}: [${report.failingChecks.join(", ")}] — animation playback continues (diagnostic only).`);
			}
			if (!Object.values(normalized.actions).some((a) => a?.isRunning())) {
				const recoverClip = resolveClipName(inputKey, normalized.actions);
				if (recoverClip && normalized.actions[recoverClip]) {
					const recoverAction = normalized.actions[recoverClip];
					const isRecoverLoop = LOOP_STATES.has(inputKey);
					recoverAction.setLoop(isRecoverLoop ? LoopRepeat : LoopOnce, isRecoverLoop ? Infinity : 1);
					recoverAction.clampWhenFinished = !isRecoverLoop;
					recoverAction.reset().play();
					activeClipRef.current = recoverClip;
					committedClipRef.current = recoverClip;
					lastCrossfadeTimeRef.current = performance.now() / 1e3;
					console.log(`[FighterMesh] 🔄 Mixer recovered after integrity test — playing "${recoverClip}" for "${integrityInput.characterName}"`);
				} else if (inputKey !== "idle" && inputKey !== "Neutral") console.warn(`[FighterMesh] ⚠️ MISSING_CLIP after integrity recovery: combatState="${inputKey}" — not substituting idle`);
			} else console.log(`[FighterMesh] ✅ Mixer still running after integrity test (static mesh path) — no recovery needed for "${integrityInput.characterName}"`);
			deformationPassedRef.current = true;
		}
		if (!deformationPassedRef.current) return;
		if (!clipName || !actions[clipName]) {
			console.warn(`[FighterMesh] ⚠️ No matching clip for state="${state}" animation="${animation}" on "${gltfUrl.split("/").pop()}"`);
			return;
		}
		const nextAction = actions[clipName];
		const fadeDuration = FADE_DURATIONS[inputKey] ?? DEFAULT_FADE;
		const isLoop = LOOP_STATES.has(inputKey);
		const currentAction = availableClips.map((k) => actions[k]).find((a) => a?.isRunning());
		const isSameClip = clipName === committedClipRef.current;
		if (isSameClip && isAttack && animationTrigger > 0) {
			console.log(`[FighterMesh] 🔁 Re-triggering attack clip "${clipName}" from start`);
			nextAction.stop();
			nextAction.reset();
			nextAction.setLoop(LoopOnce, 1);
			nextAction.clampWhenFinished = true;
			nextAction.play();
			activeClipRef.current = clipName;
			committedClipRef.current = clipName;
			lastCrossfadeTimeRef.current = performance.now() / 1e3;
			return;
		}
		const isUrgent = isAttack || [
			"hit",
			"Hitstun",
			"HitStun",
			"Stunned",
			"knockdown",
			"Knockdown",
			"ko",
			"KO",
			"Crumple"
		].includes(inputKey);
		const now = performance.now() / 1e3;
		const timeSinceLastCrossfade = now - lastCrossfadeTimeRef.current;
		if (!isUrgent && isSameClip) return;
		if (!isUrgent && timeSinceLastCrossfade < MIN_CROSSFADE_HOLD_S) {
			console.log(`[FighterMesh] ⏸ Crossfade suppressed (hold=${timeSinceLastCrossfade.toFixed(3)}s < ${MIN_CROSSFADE_HOLD_S}s) for "${clipName}"`);
			return;
		}
		nextAction.setLoop(isLoop ? LoopRepeat : LoopOnce, isLoop ? Infinity : 1);
		nextAction.clampWhenFinished = !isLoop;
		nextAction.reset();
		nextAction.setEffectiveTimeScale(1);
		nextAction.setEffectiveWeight(1);
		if (currentAction && currentAction !== nextAction) {
			currentAction.crossFadeTo(nextAction, fadeDuration, true);
			nextAction.play();
			console.log(`[FighterMesh] ↔️ Crossfade "${currentAction.getClip().name}" → "${clipName}" (${(fadeDuration * 1e3).toFixed(0)}ms / ${Math.round(fadeDuration * 60)}f)`);
		} else {
			nextAction.fadeIn(fadeDuration).play();
			console.log(`[FighterMesh] ▶️ FadeIn "${clipName}" (${(fadeDuration * 1e3).toFixed(0)}ms)`);
		}
		activeClipRef.current = clipName;
		committedClipRef.current = clipName;
		lastCrossfadeTimeRef.current = now;
	}, [
		state,
		animation,
		animationTrigger,
		normalized,
		gltfUrl,
		locomotionVelocity
	]);
	(0, import_react.useEffect)(() => {
		if (!normalized) return;
		const { actions } = normalized;
		if (Object.keys(actions).length === 0) return;
		const idleClip = resolveClipName("idle", actions);
		if (idleClip && actions[idleClip]) {
			const idleAction = actions[idleClip];
			idleAction.setLoop(LoopRepeat, Infinity);
			idleAction.reset().play();
			activeClipRef.current = idleClip;
			committedClipRef.current = idleClip;
			lastCrossfadeTimeRef.current = performance.now() / 1e3;
			console.log(`[FighterMesh] 🟢 Auto-play idle="${idleClip}" on mount for "${gltfUrl.split("/").pop()}"`);
		}
	}, [normalized]);
	(0, import_react.useEffect)(() => {
		if (!normalized) return;
		const { mixer } = normalized;
		if (hitStopActive) mixer.timeScale = 0;
		else mixer.timeScale = 1;
	}, [hitStopActive, normalized]);
	(0, import_react.useEffect)(() => {
		if (!normalized?.skeletonHelper) return;
		normalized.skeletonHelper.visible = showHitbox;
	}, [showHitbox, normalized]);
	useFrame((_, delta) => {
		if (!groupRef.current) return;
		const attacking = state === "Startup" || state === "Active";
		const bob = state === "Neutral" || state === "idle" ? Math.sin(performance.now() * .005) * .025 : 0;
		groupRef.current.position.set(position[0], position[1] + bob, position[2]);
		groupRef.current.rotation.y = rotationY;
		const attackScale = attacking ? 1.03 : 1;
		groupRef.current.scale.set(attackScale, attackScale, attackScale);
		if (normalized) {
			normalized.mixer.update(delta);
			if (normalized.skeletonHelper && showHitbox) normalized.skeletonHelper.updateMatrixWorld(true);
		}
		boneHitboxRef.current.update(delta);
	});
	if (!normalized) return null;
	const activeSpheres = boneHitboxRef.current.getActiveSpheres();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: groupRef,
		position,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				rotation: [
					0,
					normalized.forwardCorrectionY,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: normalized.scene }), normalized.skeletonHelper && showHitbox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: normalized.skeletonHelper })]
			}),
			showHitbox && hitboxGeometry && activeSpheres.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					hitboxGeometry.offsetX * (facing < 0 ? -1 : 1),
					1,
					hitboxGeometry.offsetZ
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					hitboxGeometry.width,
					1.6,
					hitboxGeometry.depth
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#ff2222",
					wireframe: true,
					transparent: true,
					opacity: .6
				})]
			}),
			showHitbox && activeSpheres.map((sphere, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					sphere.worldCenter.x - position[0],
					sphere.worldCenter.y - position[1],
					sphere.worldCenter.z - position[2]
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					sphere.radius,
					8,
					8
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: sphere.attackLevel === "high" ? "#ff4400" : sphere.attackLevel === "low" ? "#ffaa00" : "#ff2222",
					wireframe: true,
					transparent: true,
					opacity: .7
				})]
			}, `bone-hitbox-${sphere.boneSlot}-${i}`))
		]
	});
}
function FighterPlaceholder({ position }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		position,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.925,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.5,
				1.85,
				.3
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: "#333333",
				wireframe: true
			})]
		})
	});
}
function FighterMesh({ modelUrl, position, facing, rotationY = 0, state, animation, tint, showHitbox = false, hitboxGeometry = null, animationTrigger = 0, locomotionVelocity, hitStopActive = false, onRigDiagnostic, onBoneHitboxReady, onDeformationBlocked, onAnimationIntegrityReport }) {
	if (!modelUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterPlaceholder, { position });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterPlaceholder, { position }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterMeshInner, {
			gltfUrl: modelUrl,
			state,
			animation,
			position,
			facing,
			rotationY,
			tint,
			showHitbox,
			hitboxGeometry,
			animationTrigger,
			locomotionVelocity,
			hitStopActive,
			onRigDiagnostic,
			onBoneHitboxReady,
			onDeformationBlocked,
			onAnimationIntegrityReport
		})
	});
}
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	return () => {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}
function mulberry32(a) {
	return function() {
		let t = a += 1831565813;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function ProceduralStage({ stageId, p1Color, p2Color, seed }) {
	const cfg = resolveStageConfig(stageId);
	const resolvedId = cfg.id;
	const rng = (0, import_react.useMemo)(() => mulberry32(xmur3(`${seed ?? "brutal"}:${resolvedId}`)()), [seed, resolvedId]);
	const noise2D = (0, import_react.useMemo)(() => createNoise2D(rng), [rng]);
	const halfW = Number.isFinite(cfg.boundaryX) ? cfg.boundaryX : 8;
	const halfD = Number.isFinite(cfg.boundaryZ) ? cfg.boundaryZ : 6;
	const floorW = Math.min(28, Math.max(10, halfW * 2.4));
	const floorD = Math.min(18, Math.max(8, halfD * 2.2));
	const ground = (0, import_react.useMemo)(() => {
		const geo = new PlaneGeometry(floorW, floorD, 32, 20);
		geo.rotateX(-Math.PI / 2);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const z = pos.getZ(i);
			const ring = Math.max(Math.abs(x) / (floorW * .18), Math.abs(z) / (floorD * .22));
			if (ring < 1) continue;
			const n = noise2D(x * .12, z * .12) * .18 + noise2D(x * .35, z * .35) * .07;
			pos.setY(i, n * Math.min(1, (ring - 1) * 1.4));
		}
		pos.needsUpdate = true;
		geo.computeVertexNormals();
		return geo;
	}, [
		floorW,
		floorD,
		noise2D
	]);
	const buildings = (0, import_react.useMemo)(() => {
		const items = [];
		const count = 10 + Math.floor(rng() * 8);
		for (let i = 0; i < count; i++) {
			const x = (rng() < .5 ? -1 : 1) * (floorW * .42 + rng() * 4.2);
			const z = (rng() - .5) * floorD * .95;
			const h = 2.4 + rng() * 7.5;
			items.push({
				pos: [
					x,
					h / 2,
					z
				],
				scale: [
					1.1 + rng() * 2.2,
					h,
					1.1 + rng() * 2.2
				],
				rot: rng() * .2,
				windows: rng() > .35
			});
		}
		return items;
	}, [
		rng,
		floorW,
		floorD
	]);
	const lamps = (0, import_react.useMemo)(() => {
		const items = [];
		const n = 4 + Math.floor(rng() * 3);
		for (let i = 0; i < n; i++) {
			const t = i / n * Math.PI * 2;
			items.push([
				Math.cos(t) * floorW * .32,
				2.4,
				Math.sin(t) * floorD * .28
			]);
		}
		return items;
	}, [
		rng,
		floorW,
		floorD
	]);
	const crowd = (0, import_react.useMemo)(() => {
		const items = [];
		for (let i = 0; i < 14; i++) {
			const side = rng() < .5 ? -1 : 1;
			items.push([
				side * (floorW * .36 + rng() * 1.2),
				.85,
				(rng() - .5) * floorD * .7,
				1.4 + rng() * .5
			]);
		}
		return items;
	}, [
		rng,
		floorW,
		floorD
	]);
	const groundColor = cfg.bgColor;
	const accent = cfg.accentColor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: cfg.ambientIntensity,
			color: cfg.ambientColor
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				6,
				10,
				4
			],
			intensity: 1.35,
			color: cfg.primaryLightColor,
			castShadow: true,
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-5,
				6,
				-3
			],
			intensity: .45,
			color: cfg.fillLightColor
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				0,
				4.2,
				0
			],
			intensity: .8,
			color: accent,
			distance: 18
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				-4,
				2.4,
				3
			],
			intensity: .55,
			color: p1Color,
			distance: 10
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				4,
				2.4,
				3
			],
			intensity: .55,
			color: p2Color,
			distance: 10
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: ground,
			receiveShadow: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: groundColor,
				roughness: .92,
				metalness: .08
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				18,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
				42,
				16,
				12
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color: cfg.ambientColor,
				side: 1
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("gridHelper", {
			args: [
				Math.max(floorW, floorD),
				16,
				accent,
				"#1c1c22"
			],
			position: [
				0,
				.02,
				0
			]
		}),
		resolvedId === "wrestling_ring" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RingRopes, {
			width: 8,
			depth: 8,
			color: accent
		}),
		resolvedId === "mma_octagon" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OctagonFence, {
			radius: 6.4,
			color: accent
		}),
		resolvedId === "steel_cage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CageWalls, { size: 7.2 }),
		resolvedId === "dojo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DojoHall, {
			width: floorW,
			depth: floorD,
			accent
		}),
		resolvedId === "subway" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubwayRails, {}),
		resolvedId === "sky_crane" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CraneBeams, {}),
		resolvedId === "ghetto_streets" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreetSet, {
			width: floorW,
			depth: floorD,
			accent
		}),
		resolvedId === "industrial" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndustrialPipes, {}),
		resolvedId === "junkyard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JunkPiles, {}),
		(resolvedId === "spike_pit" || resolvedId === "acid_pit" || resolvedId === "grinder_pit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HazardPit, { color: accent }),
		buildings.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			position: p.pos,
			rotation: [
				0,
				p.rot,
				0
			],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: p.scale }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: i % 2 === 0 ? "#1b1b20" : "#101014",
					roughness: .85,
					metalness: resolvedId.includes("steel") || resolvedId === "industrial" ? .55 : .12,
					emissive: p.windows ? accent : "#000000",
					emissiveIntensity: p.windows ? .12 : 0
				})]
			})
		}, `b${i}`)),
		lamps.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: pos,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.05,
					.08,
					2.4,
					6
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#2a2a30",
					metalness: .6,
					roughness: .4
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						1.3,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						.12,
						8,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: accent,
						emissive: accent,
						emissiveIntensity: 2.2
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					position: [
						0,
						1.2,
						0
					],
					intensity: .55,
					color: accent,
					distance: 8
				})
			]
		}, `l${i}`)),
		crowd.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				c[0],
				c[3] / 2,
				c[2]
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
				.18,
				c[3] * .45,
				4,
				8
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#0c0c10",
				roughness: 1
			})]
		}, `c${i}`)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeonTrim, {
			width: floorW,
			depth: floorD,
			color: accent,
			noise: noise2D
		})
	] });
}
function NeonTrim({ width, depth, color, noise }) {
	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		noise(t * .1, 0);
	});
	const y = .04;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			y,
			-depth / 2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			width,
			.05,
			.05
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: 1.6
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			y,
			depth / 2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			width,
			.05,
			.05
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: 1.2
		})]
	})] });
}
function RingRopes({ width, depth, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [[
		.45,
		.85,
		1.25
	].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [[-1, 1].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			y,
			depth / 2 * s
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			width,
			.05,
			.05
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: .4
		})]
	}, `x${s}`)), [-1, 1].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			width / 2 * s,
			y,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.05,
			.05,
			depth
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: .4
		})]
	}, `z${s}`))] }, y)), [-1, 1].map((x) => [-1, 1].map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			width / 2 * x,
			.75,
			depth / 2 * z
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.12,
			.16,
			1.5,
			8
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c4c4c8",
			metalness: .7,
			roughness: .3
		})]
	}, `${x}${z}`)))] });
}
function OctagonFence({ radius, color }) {
	const sides = 8;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: Array.from({ length: sides }).map((_, i) => {
		const a = i / sides * Math.PI * 2 + Math.PI / sides;
		const x = Math.cos(a) * radius;
		const z = Math.sin(a) * radius;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x,
				1.4,
				z
			],
			rotation: [
				0,
				-a,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				radius * .85,
				2.8,
				.08
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#111114",
				metalness: .5,
				roughness: .4,
				transparent: true,
				opacity: .55,
				emissive: color,
				emissiveIntensity: .08
			})]
		}, i);
	}) });
}
function CageWalls({ size }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [[-1, 1].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			1.8,
			size / 2 * s
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			size,
			3.6,
			.08
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#2a2a30",
			metalness: .8,
			roughness: .25,
			wireframe: false,
			transparent: true,
			opacity: .45
		})]
	}, `z${s}`)), [-1, 1].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			size / 2 * s,
			1.8,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.08,
			3.6,
			size
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#2a2a30",
			metalness: .8,
			roughness: .25,
			transparent: true,
			opacity: .45
		})]
	}, `x${s}`))] });
}
function DojoHall({ width, depth, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			2.6,
			-depth / 2 + .2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			width * .7,
			.08,
			.08
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: accent,
			emissive: accent,
			emissiveIntensity: .8
		})]
	}), [-width / 3, width / 3].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			x,
			1.6,
			-depth / 2 + .4
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			1.6,
			3.2,
			.12
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#1c140e",
			roughness: .9
		})]
	}, x))] });
}
function SubwayRails() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [-1.6, 1.6].map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.04,
			z
		],
		rotation: [
			0,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			18,
			.06,
			.12
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#8a8a90",
			metalness: .85,
			roughness: .2
		})]
	}, z)) });
}
function CraneBeams() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			6.5,
			-2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			16,
			.25,
			.25
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c4b48a",
			metalness: .6,
			roughness: .35
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			-5,
			3.2,
			-2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.25,
			6.4,
			.25
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#c4b48a",
			metalness: .6,
			roughness: .35
		})]
	})] });
}
function HazardPit({ color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			-1.2,
			0
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [3.4, 24] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: .55,
			roughness: .4
		})]
	});
}
function StreetSet({ width, depth, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			.03,
			0
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [3.2, depth] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#16161a",
			roughness: .7
		})]
	}), [-1.7, 1.7].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			x,
			.04,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.08,
			.02,
			depth
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: accent,
			emissive: accent,
			emissiveIntensity: .6
		})]
	}, x))] });
}
function IndustrialPipes() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			-5.4,
			3.2,
			-1
		],
		rotation: [
			0,
			0,
			Math.PI / 2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.18,
			.18,
			8,
			8
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#4a4038",
			metalness: .7,
			roughness: .35
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			5.2,
			2.6,
			1.4
		],
		rotation: [
			0,
			0,
			Math.PI / 2
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			.14,
			.14,
			6,
			8
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#3a3834",
			metalness: .75,
			roughness: .3
		})]
	})] });
}
function JunkPiles() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [
		[
			-6,
			.6,
			-2
		],
		[
			6.2,
			.5,
			1.4
		],
		[
			-5.5,
			.4,
			2.2
		]
	].map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: p,
		rotation: [
			.2,
			i,
			.1
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dodecahedronGeometry", { args: [.9 + i * .15, 0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#2a241c",
			roughness: .95
		})]
	}, i)) });
}
function createCameraShakeState() {
	return {
		active: false,
		offsetX: 0,
		offsetY: 0,
		magnitude: 0,
		framesRemaining: 0,
		totalFrames: 0
	};
}
function createHitEffectPool() {
	const slots = [];
	for (let i = 0; i < 5; i++) slots.push({
		active: false,
		type: "clean_hit",
		screenX: 0,
		screenY: 0,
		worldX: 0,
		worldY: 0,
		worldZ: 0,
		characterColor: "#ffffff",
		scale: 1,
		life: 0,
		maxLife: .4,
		streaks: [],
		attackAngle: 0,
		pointLight: null
	});
	return {
		slots,
		cameraShake: createCameraShakeState(),
		screenFlash: 0
	};
}
function generateStreaks(type, characterColor, attackAngle, scale) {
	const streaks = [];
	if (type === "block") {
		for (let i = 0; i < 6; i++) streaks.push({
			angle: Math.PI * 2 * i / 6,
			length: 12 * scale,
			width: 2,
			color: "#8ab4d4",
			alpha: .7
		});
		return streaks;
	}
	const baseCount = type === "counter_hit" ? 12 : 8;
	const baseLength = type === "counter_hit" ? 35 * scale : 20 * scale;
	for (let i = 0; i < baseCount; i++) {
		const spread = Math.PI * .7;
		const angle = attackAngle + (Math.random() - .5) * spread;
		const length = baseLength * (.5 + Math.random() * .8);
		streaks.push({
			angle,
			length,
			width: 1.5 + Math.random() * 2,
			color: characterColor,
			alpha: .8 + Math.random() * .2
		});
	}
	for (let i = 0; i < 4; i++) {
		const angle = attackAngle + (Math.random() - .5) * .8;
		streaks.push({
			angle,
			length: baseLength * .6,
			width: 1,
			color: "#ffffff",
			alpha: 1
		});
	}
	return streaks;
}
/**
* Spawn a hit effect into the pool.
* Finds the oldest/inactive slot and reuses it.
*/
function spawnHitEffect(pool, params) {
	const { type, screenX, screenY, worldX, worldY, worldZ, characterColor, attackAngle = 0, damage = 100 } = params;
	let slotIdx = pool.slots.findIndex((s) => !s.active);
	if (slotIdx === -1) slotIdx = 0;
	const isCounter = type === "counter_hit";
	const isHeavy = damage > 150 || isCounter;
	const scale = isCounter ? 2 : isHeavy ? 1.4 : 1;
	const maxLife = isCounter ? .6 : isHeavy ? .45 : .35;
	const pointLightFrames = isCounter ? 5 : isHeavy ? 4 : 3;
	const pointLightIntensity = isCounter ? 8 : isHeavy ? 5 : 3;
	const pointLight = {
		x: worldX,
		y: worldY,
		z: worldZ,
		color: type === "block" ? "#8ab4d4" : characterColor,
		intensity: pointLightIntensity,
		maxIntensity: pointLightIntensity,
		framesRemaining: pointLightFrames,
		totalFrames: pointLightFrames
	};
	const newSlot = {
		active: true,
		type,
		screenX,
		screenY,
		worldX,
		worldY,
		worldZ,
		characterColor,
		scale,
		life: maxLife,
		maxLife,
		streaks: generateStreaks(type, characterColor, attackAngle, scale),
		attackAngle,
		pointLight
	};
	const newSlots = [...pool.slots];
	newSlots[slotIdx] = newSlot;
	const shake = getCameraShakeForHit(type, damage);
	const flashIntensity = isCounter ? .9 : isHeavy ? .5 : .25;
	return {
		slots: newSlots,
		cameraShake: shake,
		screenFlash: Math.max(pool.screenFlash, flashIntensity)
	};
}
function getCameraShakeForHit(type, damage) {
	if (type === "block") return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 1,
		framesRemaining: 3,
		totalFrames: 3
	};
	if (type === "counter_hit") return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 8,
		framesRemaining: 15,
		totalFrames: 15
	};
	if (type === "floor_slam" || type === "wall_splat") return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 6,
		framesRemaining: 12,
		totalFrames: 12
	};
	if (damage > 200) return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 5,
		framesRemaining: 10,
		totalFrames: 10
	};
	if (damage > 100) return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 3,
		framesRemaining: 6,
		totalFrames: 6
	};
	return {
		active: true,
		offsetX: 0,
		offsetY: 0,
		magnitude: 1,
		framesRemaining: 3,
		totalFrames: 3
	};
}
var TICK_DT = 1 / 60;
function tickHitEffectPool(pool) {
	const newSlots = pool.slots.map((slot) => {
		if (!slot.active) return slot;
		const newLife = slot.life - TICK_DT;
		if (newLife <= 0) return {
			...slot,
			active: false,
			life: 0,
			pointLight: null
		};
		let newPointLight = slot.pointLight;
		if (newPointLight && newPointLight.framesRemaining > 0) {
			const newFrames = newPointLight.framesRemaining - 1;
			const newIntensity = newFrames <= 0 ? 0 : newPointLight.maxIntensity * (newFrames / newPointLight.totalFrames);
			newPointLight = newFrames <= 0 ? null : {
				...newPointLight,
				framesRemaining: newFrames,
				intensity: newIntensity
			};
		}
		return {
			...slot,
			life: newLife,
			pointLight: newPointLight
		};
	});
	let newShake = pool.cameraShake;
	if (newShake.active && newShake.framesRemaining > 0) {
		const t = newShake.framesRemaining / newShake.totalFrames;
		const decayedMag = newShake.magnitude * t;
		newShake = {
			...newShake,
			offsetX: (Math.random() - .5) * 2 * decayedMag,
			offsetY: (Math.random() - .5) * 2 * decayedMag,
			framesRemaining: newShake.framesRemaining - 1,
			active: newShake.framesRemaining > 1
		};
	} else if (newShake.active) newShake = createCameraShakeState();
	const newFlash = pool.screenFlash > .01 ? pool.screenFlash * .82 : 0;
	return {
		slots: newSlots,
		cameraShake: newShake,
		screenFlash: newFlash
	};
}
function getActivePointLights(pool) {
	return pool.slots.filter((s) => s.active && s.pointLight !== null).map((s) => s.pointLight);
}
function getHitEffectRenderData(pool) {
	return pool.slots.filter((s) => s.active).map((s) => {
		const alpha = s.life / s.maxLife;
		const baseRadius = s.type === "block" ? 18 : s.type === "counter_hit" ? 40 : 24;
		return {
			screenX: s.screenX,
			screenY: s.screenY,
			characterColor: s.characterColor,
			scale: s.scale,
			alpha,
			type: s.type,
			streaks: s.streaks,
			coreRadius: Math.max(0, baseRadius * .35 * s.scale * (.5 + alpha * .5)),
			coronaRadius: Math.max(0, baseRadius * s.scale * (.4 + alpha * .6))
		};
	});
}
var P1_X = -1.8;
var P2_X = 1.8;
var Z_RANGE = 2;
function useAnnouncer(enabled) {
	return { speak: (0, import_react.useCallback)((text, pitch = .8, rate = .9) => {
		if (!enabled) return;
		if (typeof window === "undefined") return;
		const synth = window.speechSynthesis;
		if (!synth) return;
		synth.cancel();
		const utt = new SpeechSynthesisUtterance(text);
		utt.pitch = pitch;
		utt.rate = rate;
		utt.volume = .85;
		synth.speak(utt);
	}, [enabled]) };
}
function CinematicCamera({ phase, p1X, p2X, p1Z, p2Z, fov, shakeOffset }) {
	const { camera } = useThree();
	const sweepAngleRef = (0, import_react.useRef)(0);
	const phaseTimeRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const cam = camera;
		cam.fov = fov;
		cam.near = .1;
		cam.far = 200;
		cam.updateProjectionMatrix();
	}, [camera, fov]);
	useFrame((_, delta) => {
		const cam = camera;
		phaseTimeRef.current += delta;
		if (phase === "sweep") {
			sweepAngleRef.current += delta * .6;
			const angle = sweepAngleRef.current;
			const radius = 10;
			cam.position.x = Math.sin(angle) * radius;
			cam.position.y = 3.5 + Math.sin(angle * .5) * 1.5;
			cam.position.z = Math.cos(angle) * radius * .6 + 4;
			cam.lookAt(0, 1.5, 0);
			cam.updateProjectionMatrix();
		} else if (phase === "intro") {
			const t = Math.min(1, phaseTimeRef.current / 1.5);
			const targetX = 0;
			const targetY = 1 + (1 - t) * 2;
			const targetZ = 6 + (1 - t) * 3;
			cam.position.x += (targetX - cam.position.x) * .05;
			cam.position.y += (targetY - cam.position.y) * .05;
			cam.position.z += (targetZ - cam.position.z) * .05;
			cam.lookAt(0, 1.2, 0);
			cam.updateProjectionMatrix();
		} else if (phase === "fight") {
			const midX = (p1X + p2X) / 2;
			const midZ = (p1Z + p2Z) / 2;
			const dist = Math.sqrt(Math.pow(p2X - p1X, 2) + Math.pow(p2Z - p1Z, 2));
			const targetCamZ = Math.max(4.5, Math.min(11, dist * 1.05 + 3));
			const targetCamY = 2 + dist * .05;
			cam.position.x += (midX - cam.position.x) * .1;
			cam.position.y += (targetCamY - cam.position.y) * .07;
			cam.position.z += (targetCamZ + midZ * .25 - cam.position.z) * .08;
			if (shakeOffset && (Math.abs(shakeOffset.x) > .001 || Math.abs(shakeOffset.y) > .001)) {
				cam.position.x += shakeOffset.x * .01;
				cam.position.y += shakeOffset.y * .01;
			}
			cam.lookAt(midX, 1.1, midZ * .15);
			cam.updateProjectionMatrix();
		} else if (phase === "victory") {
			const targetX = p1X;
			const targetY = 1.8;
			const targetZ = 3.5;
			cam.position.x += (targetX - cam.position.x) * .04;
			cam.position.y += (targetY - cam.position.y) * .04;
			cam.position.z += (targetZ - cam.position.z) * .04;
			cam.lookAt(p1X, 1.5, 0);
			cam.updateProjectionMatrix();
		}
	});
	return null;
}
function BlobShadow({ x, z, scale = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			x,
			.005,
			z
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.45 * scale, 16] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#000000",
			transparent: true,
			opacity: .55,
			depthWrite: false
		})]
	});
}
function VFXOverlay({ particles, screenFlash, hitStopActive, hitEffectPool }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const totalFlash = Math.max(screenFlash, hitEffectPool?.screenFlash ?? 0);
		if (totalFlash > .01) {
			ctx.fillStyle = `rgba(255,255,255,${totalFlash * .35})`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		if (hitStopActive) {
			ctx.fillStyle = "rgba(255,50,50,0.06)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		for (const p of particles) {
			const alpha = Math.min(1, Math.max(0, p.life / p.maxLife));
			ctx.globalAlpha = alpha;
			if (p.type === "impact") {
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(p.x, p.y, Math.max(0, p.size * alpha), 0, Math.PI * 2);
				ctx.fill();
			} else if (p.type === "burst") {
				ctx.strokeStyle = p.color;
				ctx.lineWidth = p.size * .5;
				ctx.beginPath();
				ctx.arc(p.x, p.y, Math.max(0, p.size * (1 - alpha) * 20), 0, Math.PI * 2);
				ctx.stroke();
			} else if (p.type === "trail") {
				ctx.fillStyle = p.color;
				ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 2);
			}
		}
		if (hitEffectPool) {
			const renderData = getHitEffectRenderData(hitEffectPool);
			for (const effect of renderData) {
				const { screenX, screenY, characterColor, scale, alpha, type, streaks, coreRadius, coronaRadius } = effect;
				ctx.save();
				ctx.translate(screenX, screenY);
				for (const streak of streaks) {
					ctx.save();
					ctx.rotate(streak.angle);
					ctx.globalAlpha = streak.alpha * alpha;
					ctx.strokeStyle = streak.color;
					ctx.lineWidth = streak.width;
					ctx.lineCap = "round";
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(streak.length, 0);
					ctx.stroke();
					ctx.restore();
				}
				if (type === "block") {
					ctx.globalAlpha = alpha * .8;
					const safeCoronaBlock = Math.max(.001, coronaRadius);
					const shieldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, safeCoronaBlock);
					shieldGrad.addColorStop(0, "rgba(138,180,212,0.9)");
					shieldGrad.addColorStop(.5, "rgba(138,180,212,0.4)");
					shieldGrad.addColorStop(1, "rgba(138,180,212,0)");
					ctx.fillStyle = shieldGrad;
					ctx.beginPath();
					ctx.arc(0, 0, safeCoronaBlock, 0, Math.PI * 2);
					ctx.fill();
				} else {
					ctx.globalAlpha = alpha * .85;
					const safeCorona = Math.max(.001, coronaRadius);
					const coronaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, safeCorona);
					const hex = characterColor;
					coronaGrad.addColorStop(0, `${hex}ff`);
					coronaGrad.addColorStop(.4, `${hex}cc`);
					coronaGrad.addColorStop(1, `${hex}00`);
					ctx.fillStyle = coronaGrad;
					ctx.beginPath();
					ctx.arc(0, 0, safeCorona, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = alpha;
				const safeCore = Math.max(.001, coreRadius);
				const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, safeCore);
				coreGrad.addColorStop(0, "rgba(255,255,255,1)");
				coreGrad.addColorStop(.6, "rgba(255,255,255,0.8)");
				coreGrad.addColorStop(1, "rgba(255,255,255,0)");
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(0, 0, safeCore, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
		}
		ctx.globalAlpha = 1;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		width: 800,
		height: 600,
		className: "absolute inset-0 w-full h-full pointer-events-none z-20",
		style: { mixBlendMode: "screen" }
	});
}
function TrainingLighting({ p1Color, p2Color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			intensity: .3,
			color: "#c8d0e0"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				0,
				8,
				4
			],
			intensity: 2.5,
			color: "#fff8f0",
			castShadow: true,
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-5,
				4,
				3
			],
			intensity: .8,
			color: "#a0b8ff"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				0,
				5,
				-6
			],
			intensity: 1,
			color: "#ffffff"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				-3.8,
				6,
				2
			],
			intensity: 1.5,
			color: p1Color,
			angle: .4,
			penumbra: .6,
			distance: 12,
			decay: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
			position: [
				3.8,
				6,
				2
			],
			intensity: 1.5,
			color: p2Color,
			angle: .4,
			penumbra: .6,
			distance: 12,
			decay: 2
		})
	] });
}
function IntroOverlay({ phase, p1Name, p2Name }) {
	if (phase !== "sweep" && phase !== "intro") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 pointer-events-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 right-0 h-[12%] bg-black" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-0 right-0 h-[12%] bg-black" }),
			phase === "sweep" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-[0.6em] text-zinc-500 animate-pulse",
						children: "LOADING ARENA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 text-2xl font-black tracking-widest text-white",
						children: "BRUTAL FIST"
					})]
				})
			}),
			phase === "intro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex items-end justify-between px-8 pb-[14%]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[8px] tracking-[0.4em] text-zinc-500",
							children: "PLAYER 1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-black tracking-widest text-white animate-pulse",
							children: p1Name.toUpperCase()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-black tracking-[0.3em] text-yellow-400",
							children: "VS"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[8px] tracking-[0.4em] text-zinc-500",
							children: "PLAYER 2"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-black tracking-widest text-white animate-pulse",
							children: p2Name.toUpperCase()
						})]
					})
				]
			})
		]
	});
}
function VictoryOverlay({ phase, winnerName }) {
	if (phase !== "victory" || !winnerName) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 pointer-events-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 right-0 h-[12%] bg-black" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-0 right-0 h-[12%] bg-black" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col items-center justify-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-[0.6em] text-zinc-400",
						children: "WINNER"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-4xl font-black tracking-widest text-yellow-400",
						style: { textShadow: "0 0 40px #facc15, 0 0 80px #facc1544" },
						children: winnerName.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm tracking-[0.4em] text-white mt-1",
						children: "WINS"
					})
				]
			})
		]
	});
}
function getCharacterHitBloom(fighterId, factionColor) {
	return (CHARACTER_BLOOM[fighterId] ?? CHARACTER_BLOOM.default).primary ?? factionColor;
}
function spawnKnockdownDust(screenX, screenY, particleIdRef) {
	const dust = [];
	for (let i = 0; i < 16; i++) {
		const angle = Math.PI * i / 8;
		const speed = 2 + Math.random() * 5;
		dust.push({
			id: ++particleIdRef.current,
			x: screenX + (Math.random() - .5) * 30,
			y: screenY,
			vx: Math.cos(angle) * speed,
			vy: -Math.abs(Math.sin(angle) * speed) - 1,
			life: .8 + Math.random() * .5,
			maxLife: .8 + Math.random() * .5,
			color: "#c4a882",
			size: 5 + Math.random() * 8,
			type: "impact"
		});
	}
	for (let i = 0; i < 5; i++) dust.push({
		id: ++particleIdRef.current,
		x: screenX + (Math.random() - .5) * 50,
		y: screenY,
		vx: (Math.random() - .5) * 2,
		vy: -.5 - Math.random() * 1.5,
		life: 1.2 + Math.random() * .6,
		maxLife: 1.2 + Math.random() * .6,
		color: "#a89070",
		size: 14 + Math.random() * 12,
		type: "burst"
	});
	return dust;
}
createHitEffectPool();
function HitPointLights({ lights }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: lights.map((light, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		position: [
			light.x,
			light.y,
			light.z
		],
		color: light.color,
		intensity: light.intensity,
		distance: 4,
		decay: 2
	}, i)) });
}
function CombatArena3D({ p1Fighter, p2Fighter, p1State, p2State, p1Animation, p2Animation, p1Color, p2Color, hitStopActive, p1SkinTint, p2SkinTint, p1Z = 0, p2Z = 0, p1X: p1XProp = P1_X, p2X: p2XProp = P2_X, cinematicPhase = "fight", winnerName, cameraFov = 55, announcerEnabled = true, damageEvent, knockdownEvent, stageId = "urban_night", p1AnimTrigger = 0, p2AnimTrigger = 0, p1LocomotionVelocity, p2LocomotionVelocity, onP1BoneHitboxReady, onP2BoneHitboxReady, wallSplatEvent, heatBurstEvent, rageArtEvent, cameraShakeOffset, onDeformationBlocked }) {
	const [particles, setParticles] = (0, import_react.useState)([]);
	const [screenFlash, setScreenFlash] = (0, import_react.useState)(0);
	const [hitEffectPool, setHitEffectPool] = (0, import_react.useState)(() => createHitEffectPool());
	const particleIdRef = (0, import_react.useRef)(0);
	(0, import_react.useRef)(0);
	const hitEffectRafRef = (0, import_react.useRef)(0);
	const prevDamageEventRef = (0, import_react.useRef)(void 0);
	const prevKnockdownEventRef = (0, import_react.useRef)(void 0);
	const prevWallSplatEventRef = (0, import_react.useRef)(void 0);
	const prevHeatBurstEventRef = (0, import_react.useRef)(void 0);
	const prevRageArtEventRef = (0, import_react.useRef)(void 0);
	const { speak } = useAnnouncer(announcerEnabled);
	(0, import_react.useEffect)(() => {
		if (cinematicPhase === "intro") {
			const t1 = setTimeout(() => speak("Round 1", .7, .85), 800);
			const t2 = setTimeout(() => speak("Fight!", .65, 1), 2200);
			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
			};
		}
		if (cinematicPhase === "victory" && winnerName) {
			const t = setTimeout(() => speak(`${winnerName} wins!`, .7, .9), 400);
			return () => clearTimeout(t);
		}
	}, [
		cinematicPhase,
		winnerName,
		speak
	]);
	(0, import_react.useEffect)(() => {
		if (!knockdownEvent) return;
		if (prevKnockdownEventRef.current?.count === knockdownEvent.count) return;
		prevKnockdownEventRef.current = knockdownEvent;
		const { player } = knockdownEvent;
		const dustParticles = spawnKnockdownDust((player === "p1" ? .3 : .7) * 800, 340, particleIdRef);
		setParticles((prev) => [...prev.slice(-50), ...dustParticles]);
	}, [knockdownEvent]);
	(0, import_react.useEffect)(() => {
		return () => cancelAnimationFrame(hitEffectRafRef.current);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!damageEvent) return;
		if (prevDamageEventRef.current?.count === damageEvent.count) return;
		prevDamageEventRef.current = damageEvent;
		const { player, damage, isCounter, factionColor } = damageEvent;
		const bloomColor = getCharacterHitBloom((player === "p2" ? p1Fighter : p2Fighter).id, factionColor);
		const screenX = (player === "p1" ? .28 : .72) * 800;
		const screenY = 180 + Math.random() * 80;
		const worldX = player === "p1" ? -1.5 : 1.5;
		const effectType = isCounter ? "counter_hit" : "clean_hit";
		setHitEffectPool((prev) => spawnHitEffect(prev, {
			type: effectType,
			screenX,
			screenY,
			worldX,
			worldY: 1.2,
			worldZ: 0,
			characterColor: bloomColor,
			attackAngle: player === "p1" ? Math.PI : 0,
			damage
		}));
		hitEffectRafRef.current = requestAnimationFrame(() => {
			setHitEffectPool((prev) => tickHitEffectPool(prev));
		});
	}, [
		damageEvent,
		p1Fighter,
		p2Fighter
	]);
	(0, import_react.useEffect)(() => {
		if (!wallSplatEvent) return;
		if (prevWallSplatEventRef.current?.count === wallSplatEvent.count) return;
		prevWallSplatEventRef.current = wallSplatEvent;
		const { player, wall } = wallSplatEvent;
		const screenX = (player === "p1" ? wall === "left" ? .05 : .95 : wall === "left" ? .05 : .95) * 800;
		const screenY = 200 + Math.random() * 80;
		const bloomColor = getCharacterHitBloom((player === "p2" ? p1Fighter : p2Fighter).id, "#ffffff");
		setHitEffectPool((prev) => spawnHitEffect(prev, {
			type: "wall_splat",
			screenX,
			screenY,
			worldX: wall === "left" ? -4.5 : 4.5,
			worldY: 1.2,
			worldZ: 0,
			characterColor: bloomColor,
			attackAngle: wall === "left" ? 0 : Math.PI,
			damage: 150
		}));
		hitEffectRafRef.current = requestAnimationFrame(() => {
			setHitEffectPool((prev) => tickHitEffectPool(prev));
		});
	}, [
		wallSplatEvent,
		p1Fighter,
		p2Fighter
	]);
	(0, import_react.useEffect)(() => {
		if (!heatBurstEvent) return;
		if (prevHeatBurstEventRef.current?.count === heatBurstEvent.count) return;
		prevHeatBurstEventRef.current = heatBurstEvent;
		const { player } = heatBurstEvent;
		const screenX = player === "p1" ? 240 : 560;
		const screenY = 180;
		const bloomColor = getCharacterHitBloom((player === "p1" ? p1Fighter : p2Fighter).id, "#ff8800");
		setHitEffectPool((prev) => {
			let pool = prev;
			for (let i = 0; i < 3; i++) pool = spawnHitEffect(pool, {
				type: "counter_hit",
				screenX: screenX + (Math.random() - .5) * 60,
				screenY: screenY + (Math.random() - .5) * 40,
				worldX: player === "p1" ? -1.8 : 1.8,
				worldY: 1.5,
				worldZ: 0,
				characterColor: bloomColor,
				attackAngle: Math.random() * Math.PI * 2,
				damage: 200
			});
			return pool;
		});
		hitEffectRafRef.current = requestAnimationFrame(() => {
			setHitEffectPool((prev) => tickHitEffectPool(prev));
		});
	}, [
		heatBurstEvent,
		p1Fighter,
		p2Fighter
	]);
	(0, import_react.useEffect)(() => {
		if (!rageArtEvent) return;
		if (prevRageArtEventRef.current?.count === rageArtEvent.count) return;
		prevRageArtEventRef.current = rageArtEvent;
		const { player } = rageArtEvent;
		const screenX = player === "p1" ? 240 : 560;
		const bloomColor = getCharacterHitBloom((player === "p1" ? p1Fighter : p2Fighter).id, "#ff0000");
		setHitEffectPool((prev) => {
			let pool = prev;
			for (let i = 0; i < 5; i++) pool = spawnHitEffect(pool, {
				type: "counter_hit",
				screenX: screenX + (Math.random() - .5) * 120,
				screenY: 150 + Math.random() * 200,
				worldX: player === "p1" ? -1.8 : 1.8,
				worldY: 1.2 + Math.random() * .8,
				worldZ: 0,
				characterColor: bloomColor,
				attackAngle: Math.random() * Math.PI * 2,
				damage: 400
			});
			return pool;
		});
		setScreenFlash(1);
		hitEffectRafRef.current = requestAnimationFrame(() => {
			setHitEffectPool((prev) => tickHitEffectPool(prev));
		});
	}, [
		rageArtEvent,
		p1Fighter,
		p2Fighter
	]);
	(0, import_react.useEffect)(() => {
		if (particles.length === 0) return;
		const interval = setInterval(() => {
			setParticles((prev) => {
				return prev.map((p) => ({
					...p,
					x: p.x + p.vx,
					y: p.y + p.vy,
					vy: p.vy + .3,
					life: p.life - .016
				})).filter((p) => p.life > 0);
			});
		}, 16);
		return () => clearInterval(interval);
	}, [particles.length]);
	const p1XOffset = p1State === "Startup" || p1State === "Active" ? .3 : 0;
	const p2XOffset = p2State === "Startup" || p2State === "Active" ? -.3 : 0;
	const p1FinalX = p1XProp + p1XOffset;
	const p2FinalX = p2XProp + p2XOffset;
	const p1FinalZ = Math.max(-2, Math.min(Z_RANGE, p1Z));
	const p2FinalZ = Math.max(-2, Math.min(Z_RANGE, p2Z));
	const p2RotationY = Math.PI;
	const fogColor = stageId === "urban_night" ? "#050508" : "#050508";
	const bgColor = stageId === "urban_night" ? "#030305" : "#050508";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
				shadows: true,
				gl: {
					antialias: false,
					alpha: false
				},
				style: {
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
					background: bgColor
				},
				camera: {
					position: [
						0,
						2.2,
						7
					],
					fov: cameraFov,
					near: .1,
					far: 200
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
						attach: "background",
						args: [bgColor]
					}),
					stageId === "urban_night" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fogExp2", {
						attach: "fog",
						args: [fogColor, .028]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
						attach: "fog",
						args: [
							fogColor,
							18,
							40
						]
					}),
					stageId === "urban_night" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrbanNightStage, {
						p1Color,
						p2Color
					}) : stageId === "training" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainingLighting, {
						p1Color,
						p2Color
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainingStage, {
						p1Color,
						p2Color
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProceduralStage, {
						stageId,
						p1Color,
						p2Color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlobShadow, {
						x: p1FinalX,
						z: p1FinalZ,
						scale: p1State === "KO" ? .7 : 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlobShadow, {
						x: p2FinalX,
						z: p2FinalZ,
						scale: p2State === "KO" ? .7 : 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HitPointLights, { lights: getActivePointLights(hitEffectPool) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterMesh, {
						state: p1State,
						animation: p1Animation,
						modelUrl: getFighterGlbUrl(p1Fighter.id, p1Fighter.model) ?? p1Fighter.portraitUrl,
						position: [
							p1FinalX,
							0,
							p1FinalZ
						],
						facing: 1,
						rotationY: 0,
						tint: p1SkinTint ?? p1Color,
						animationTrigger: p1AnimTrigger,
						locomotionVelocity: p1LocomotionVelocity,
						hitStopActive,
						onBoneHitboxReady: onP1BoneHitboxReady,
						onDeformationBlocked: (characterName, failingChecks) => {
							console.error(`[CombatArena3D] 🚫 P1 DEFORMATION BLOCKED — ${characterName} | Failing: [${failingChecks.join(", ")}] | Combat frozen.`);
							onDeformationBlocked?.("p1", characterName, failingChecks);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterMesh, {
						state: p2State,
						animation: p2Animation,
						modelUrl: getFighterGlbUrl(p2Fighter.id, p2Fighter.model) ?? p2Fighter.portraitUrl,
						position: [
							p2FinalX,
							0,
							p2FinalZ
						],
						facing: -1,
						rotationY: p2RotationY,
						tint: p2SkinTint ?? p2Color,
						animationTrigger: p2AnimTrigger,
						locomotionVelocity: p2LocomotionVelocity,
						hitStopActive,
						onBoneHitboxReady: onP2BoneHitboxReady,
						onDeformationBlocked: (characterName, failingChecks) => {
							console.error(`[CombatArena3D] 🚫 P2 DEFORMATION BLOCKED — ${characterName} | Failing: [${failingChecks.join(", ")}] | Combat frozen.`);
							onDeformationBlocked?.("p2", characterName, failingChecks);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CinematicCamera, {
						phase: cinematicPhase,
						p1X: p1FinalX,
						p2X: p2FinalX,
						p1Z: p1FinalZ,
						p2Z: p2FinalZ,
						fov: cameraFov,
						shakeOffset: cameraShakeOffset
					}),
					hitStopActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
						intensity: .8,
						color: "#ffffff"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VFXOverlay, {
				particles,
				screenFlash,
				hitStopActive,
				hitEffectPool
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntroOverlay, {
				phase: cinematicPhase,
				p1Name: p1Fighter.name,
				p2Name: p2Fighter.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VictoryOverlay, {
				phase: cinematicPhase,
				winnerName
			})
		]
	});
}
//#endregion
export { CombatArena3D as default };
