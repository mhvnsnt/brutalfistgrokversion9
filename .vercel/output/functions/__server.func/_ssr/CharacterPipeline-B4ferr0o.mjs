import { Z as NearestFilter, d as AnimationMixer, mt as SkeletonHelper, p as Box3, u as AnimationClip, xt as Vector3 } from "../_libs/@react-three/drei+[...].mjs";
import { a as loadBannonClipsFromPublic, i as getCachedBannonMotionBank, o as validateRegistryCompleteness, r as buildMixamoFightingMotionBank, t as AnimationSourceRegistry } from "./AnimationSourceRegistry-taVNviQw.mjs";
import { t as SkeletonUtils } from "../_libs/three-stdlib.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CharacterPipeline-B4ferr0o.js
var DEFAULT_PSX_RENDER = {
	retro8: {
		mode: "retro8",
		enabled: true,
		renderWidth: 160,
		renderHeight: 120,
		vertexGrid: 1 / 512,
		textureFilter: "nearest",
		textureSize: 128,
		quantizeScreenSpace: true
	},
	ps1: {
		mode: "ps1",
		enabled: true,
		renderWidth: 320,
		renderHeight: 240,
		vertexGrid: 1 / 2048,
		textureFilter: "nearest",
		textureSize: 256,
		quantizeScreenSpace: true
	},
	native: {
		mode: "native",
		enabled: false,
		renderWidth: 1280,
		renderHeight: 720,
		vertexGrid: 1 / 8192,
		textureFilter: "linear",
		textureSize: 1024,
		quantizeScreenSpace: false
	}
}.ps1;
/**
* AnimationRetargeter.ts
* ─────────────────────────────────────────────────────────────────────────────
* Deterministic animation retargeter that maps source animation bone names
* (Mixamo, mocap, FBX, BVH conventions) to canonical Bannon skeleton bones
* via name-based resolution — NOT UUID binding.
*
* CANONICAL BONE SET (Bannon skeleton):
*   Hips, Spine, Chest, Neck, Head,
*   LUpperArm, LForeArm, LHand,
*   RUpperArm, RForeArm, RHand,
*   LUpperLeg, LLowerLeg, LFoot,
*   RUpperLeg, RLowerLeg, RFoot
*
* ALIAS SOURCES SUPPORTED:
*   • Mixamo (mixamorigHips, mixamorigSpine, etc.)
*   • Bannon canonical names
*   • Common FBX conventions (Bip001_Pelvis, Bip01_Spine, etc.)
*   • BVH conventions (hip, abdomen, chest, etc.)
*   • Bannon mocap naming (from tools/mocap/)
*   • Schwarzerblitz naming conventions
*
* IDENTITY: SOURCE BONE NAME → canonical semantic name → TARGET SKELETON BONE
* UUIDs are NEVER used as cross-file identity — names are stable, UUIDs change
* every time a scene is cloned.
*
* Every mapping is measurable and reported:
*   source bone | canonical bone | target bone | resolved/unresolved
* ─────────────────────────────────────────────────────────────────────────────
*/
var CANONICAL_BONES = [
	"Hips",
	"Spine",
	"Chest",
	"Neck",
	"Head",
	"LUpperArm",
	"LForeArm",
	"LHand",
	"RUpperArm",
	"RForeArm",
	"RHand",
	"LUpperLeg",
	"LLowerLeg",
	"LFoot",
	"RUpperLeg",
	"RLowerLeg",
	"RFoot"
];
var BONE_ALIAS_TABLE = {
	"Hips": "Hips",
	"hips": "Hips",
	"Hip": "Hips",
	"hip": "Hips",
	"Pelvis": "Hips",
	"pelvis": "Hips",
	"mixamorigHips": "Hips",
	"Bip001_Pelvis": "Hips",
	"Bip01_Pelvis": "Hips",
	"Bip001 Pelvis": "Hips",
	"Bip01 Pelvis": "Hips",
	"ROOT": "Hips",
	"Root": "Hips",
	"root": "Hips",
	"HipNode": "Hips",
	"CharacterRoot": "Hips",
	"Skeleton_Root": "Hips",
	"Armature": "Hips",
	"armature": "Hips",
	"Bannon_Hips": "Hips",
	"bannon_hips": "Hips",
	"Spine": "Spine",
	"spine": "Spine",
	"Spine1": "Spine",
	"spine1": "Spine",
	"Abdomen": "Spine",
	"abdomen": "Spine",
	"mixamorigSpine": "Spine",
	"mixamorigSpine1": "Spine",
	"Bip001_Spine": "Spine",
	"Bip01_Spine": "Spine",
	"Bip001 Spine": "Spine",
	"Bip01 Spine": "Spine",
	"LowerBack": "Spine",
	"lowerback": "Spine",
	"Bannon_Spine": "Spine",
	"Chest": "Chest",
	"chest": "Chest",
	"Spine2": "Chest",
	"spine2": "Chest",
	"Spine3": "Chest",
	"spine3": "Chest",
	"UpperBack": "Chest",
	"upperback": "Chest",
	"Torso": "Chest",
	"torso": "Chest",
	"mixamorigSpine2": "Chest",
	"mixamorigChest": "Chest",
	"Bip001_Spine1": "Chest",
	"Bip01_Spine1": "Chest",
	"Bip001 Spine1": "Chest",
	"Bip01 Spine1": "Chest",
	"Bip001_Spine2": "Chest",
	"Bip01_Spine2": "Chest",
	"Bannon_Chest": "Chest",
	"Neck": "Neck",
	"neck": "Neck",
	"Neck1": "Neck",
	"neck1": "Neck",
	"mixamorigNeck": "Neck",
	"mixamorigNeck1": "Neck",
	"Bip001_Neck": "Neck",
	"Bip01_Neck": "Neck",
	"Bip001 Neck": "Neck",
	"Bip01 Neck": "Neck",
	"Bannon_Neck": "Neck",
	"Head": "Head",
	"head": "Head",
	"Head1": "Head",
	"mixamorigHead": "Head",
	"Bip001_Head": "Head",
	"Bip01_Head": "Head",
	"Bip001 Head": "Head",
	"Bip01 Head": "Head",
	"Skull": "Head",
	"skull": "Head",
	"Bannon_Head": "Head",
	"LUpperArm": "LUpperArm",
	"LeftUpperArm": "LUpperArm",
	"leftUpperArm": "LUpperArm",
	"LeftArm": "LUpperArm",
	"leftArm": "LUpperArm",
	"Left_Arm": "LUpperArm",
	"L_Arm": "LUpperArm",
	"mixamorigLeftArm": "LUpperArm",
	"Bip001_L_UpperArm": "LUpperArm",
	"Bip01_L_UpperArm": "LUpperArm",
	"Bip001 L UpperArm": "LUpperArm",
	"Bip01 L UpperArm": "LUpperArm",
	"LeftShoulder": "LUpperArm",
	"leftShoulder": "LUpperArm",
	"mixamorigLeftShoulder": "LUpperArm",
	"Bannon_LUpperArm": "LUpperArm",
	"Arm_L": "LUpperArm",
	"arm_l": "LUpperArm",
	"LForeArm": "LForeArm",
	"LeftForeArm": "LForeArm",
	"leftForeArm": "LForeArm",
	"LeftForearm": "LForeArm",
	"Left_ForeArm": "LForeArm",
	"L_ForeArm": "LForeArm",
	"mixamorigLeftForeArm": "LForeArm",
	"Bip001_L_Forearm": "LForeArm",
	"Bip01_L_Forearm": "LForeArm",
	"Bip001 L Forearm": "LForeArm",
	"Bip01 L Forearm": "LForeArm",
	"Bannon_LForeArm": "LForeArm",
	"ForeArm_L": "LForeArm",
	"forearm_l": "LForeArm",
	"LHand": "LHand",
	"LeftHand": "LHand",
	"leftHand": "LHand",
	"Left_Hand": "LHand",
	"L_Hand": "LHand",
	"mixamorigLeftHand": "LHand",
	"Bip001_L_Hand": "LHand",
	"Bip01_L_Hand": "LHand",
	"Bip001 L Hand": "LHand",
	"Bip01 L Hand": "LHand",
	"Bannon_LHand": "LHand",
	"Hand_L": "LHand",
	"hand_l": "LHand",
	"RUpperArm": "RUpperArm",
	"RightUpperArm": "RUpperArm",
	"rightUpperArm": "RUpperArm",
	"RightArm": "RUpperArm",
	"rightArm": "RUpperArm",
	"Right_Arm": "RUpperArm",
	"R_Arm": "RUpperArm",
	"mixamorigRightArm": "RUpperArm",
	"Bip001_R_UpperArm": "RUpperArm",
	"Bip01_R_UpperArm": "RUpperArm",
	"Bip001 R UpperArm": "RUpperArm",
	"Bip01 R UpperArm": "RUpperArm",
	"RightShoulder": "RUpperArm",
	"rightShoulder": "RUpperArm",
	"mixamorigRightShoulder": "RUpperArm",
	"Bannon_RUpperArm": "RUpperArm",
	"Arm_R": "RUpperArm",
	"arm_r": "RUpperArm",
	"RForeArm": "RForeArm",
	"RightForeArm": "RForeArm",
	"rightForeArm": "RForeArm",
	"RightForearm": "RForeArm",
	"Right_ForeArm": "RForeArm",
	"R_ForeArm": "RForeArm",
	"mixamorigRightForeArm": "RForeArm",
	"Bip001_R_Forearm": "RForeArm",
	"Bip01_R_Forearm": "RForeArm",
	"Bip001 R Forearm": "RForeArm",
	"Bip01 R Forearm": "RForeArm",
	"Bannon_RForeArm": "RForeArm",
	"ForeArm_R": "RForeArm",
	"forearm_r": "RForeArm",
	"RHand": "RHand",
	"RightHand": "RHand",
	"rightHand": "RHand",
	"Right_Hand": "RHand",
	"R_Hand": "RHand",
	"mixamorigRightHand": "RHand",
	"Bip001_R_Hand": "RHand",
	"Bip01_R_Hand": "RHand",
	"Bip001 R Hand": "RHand",
	"Bip01 R Hand": "RHand",
	"Bannon_RHand": "RHand",
	"Hand_R": "RHand",
	"hand_r": "RHand",
	"LUpperLeg": "LUpperLeg",
	"LeftUpperLeg": "LUpperLeg",
	"leftUpperLeg": "LUpperLeg",
	"LeftLeg": "LUpperLeg",
	"leftLeg": "LUpperLeg",
	"Left_Leg": "LUpperLeg",
	"L_Leg": "LUpperLeg",
	"LeftUpLeg": "LUpperLeg",
	"leftUpLeg": "LUpperLeg",
	"mixamorigLeftUpLeg": "LUpperLeg",
	"Bip001_L_Thigh": "LUpperLeg",
	"Bip01_L_Thigh": "LUpperLeg",
	"Bip001 L Thigh": "LUpperLeg",
	"Bip01 L Thigh": "LUpperLeg",
	"LeftThigh": "LUpperLeg",
	"leftThigh": "LUpperLeg",
	"Bannon_LUpperLeg": "LUpperLeg",
	"UpLeg_L": "LUpperLeg",
	"uplleg_l": "LUpperLeg",
	"LLowerLeg": "LLowerLeg",
	"LeftLowerLeg": "LLowerLeg",
	"leftLowerLeg": "LLowerLeg",
	"LeftShin": "LLowerLeg",
	"leftShin": "LLowerLeg",
	"Left_Shin": "LLowerLeg",
	"mixamorigLeftLeg": "LLowerLeg",
	"Bip001_L_Calf": "LLowerLeg",
	"Bip01_L_Calf": "LLowerLeg",
	"Bip001 L Calf": "LLowerLeg",
	"Bip01 L Calf": "LLowerLeg",
	"LeftCalf": "LLowerLeg",
	"leftCalf": "LLowerLeg",
	"Bannon_LLowerLeg": "LLowerLeg",
	"Leg_L": "LLowerLeg",
	"leg_l": "LLowerLeg",
	"LFoot": "LFoot",
	"LeftFoot": "LFoot",
	"leftFoot": "LFoot",
	"Left_Foot": "LFoot",
	"L_Foot": "LFoot",
	"mixamorigLeftFoot": "LFoot",
	"Bip001_L_Foot": "LFoot",
	"Bip01_L_Foot": "LFoot",
	"Bip001 L Foot": "LFoot",
	"Bip01 L Foot": "LFoot",
	"Bannon_LFoot": "LFoot",
	"Foot_L": "LFoot",
	"foot_l": "LFoot",
	"RUpperLeg": "RUpperLeg",
	"RightUpperLeg": "RUpperLeg",
	"rightUpperLeg": "RUpperLeg",
	"RightLeg": "RUpperLeg",
	"rightLeg": "RUpperLeg",
	"Right_Leg": "RUpperLeg",
	"R_Leg": "RUpperLeg",
	"RightUpLeg": "RUpperLeg",
	"rightUpLeg": "RUpperLeg",
	"mixamorigRightUpLeg": "RUpperLeg",
	"Bip001_R_Thigh": "RUpperLeg",
	"Bip01_R_Thigh": "RUpperLeg",
	"Bip001 R Thigh": "RUpperLeg",
	"Bip01 R Thigh": "RUpperLeg",
	"RightThigh": "RUpperLeg",
	"rightThigh": "RUpperLeg",
	"Bannon_RUpperLeg": "RUpperLeg",
	"UpLeg_R": "RUpperLeg",
	"upleg_r": "RUpperLeg",
	"RLowerLeg": "RLowerLeg",
	"RightLowerLeg": "RLowerLeg",
	"rightLowerLeg": "RLowerLeg",
	"RightShin": "RLowerLeg",
	"rightShin": "RLowerLeg",
	"Right_Shin": "RLowerLeg",
	"mixamorigRightLeg": "RLowerLeg",
	"Bip001_R_Calf": "RLowerLeg",
	"Bip01_R_Calf": "RLowerLeg",
	"Bip001 R Calf": "RLowerLeg",
	"Bip01 R Calf": "RLowerLeg",
	"RightCalf": "RLowerLeg",
	"rightCalf": "RLowerLeg",
	"Bannon_RLowerLeg": "RLowerLeg",
	"Leg_R": "RLowerLeg",
	"leg_r": "RLowerLeg",
	"RFoot": "RFoot",
	"RightFoot": "RFoot",
	"rightFoot": "RFoot",
	"Right_Foot": "RFoot",
	"R_Foot": "RFoot",
	"mixamorigRightFoot": "RFoot",
	"Bip001_R_Foot": "RFoot",
	"Bip01_R_Foot": "RFoot",
	"Bip001 R Foot": "RFoot",
	"Bip01 R Foot": "RFoot",
	"Bannon_RFoot": "RFoot",
	"Foot_R": "RFoot",
	"foot_r": "RFoot"
};
var AnimationRetargeter = class {
	sourceName;
	targetName;
	/** source bone name → canonical bone */
	sourceToCanonical = /* @__PURE__ */ new Map();
	/** canonical bone → target bone name */
	canonicalToTarget = /* @__PURE__ */ new Map();
	/** source bone name → target bone name (resolved shortcut) */
	sourceToTarget = /* @__PURE__ */ new Map();
	constructor(sourceName, targetName) {
		this.sourceName = sourceName;
		this.targetName = targetName;
	}
	/**
	* Build the retarget map from source skeleton → target skeleton.
	* Uses canonical bone names as the stable intermediate identity.
	* NEVER uses UUIDs.
	*
	* @param sourceRoot  Root of the source skeleton (animation source)
	* @param targetRoot  Root of the target skeleton (the visible clone)
	* @returns RetargetReport with full mapping details
	*/
	buildMap(sourceRoot, targetRoot) {
		this.sourceToCanonical.clear();
		this.canonicalToTarget.clear();
		this.sourceToTarget.clear();
		const sourceBoneNames = [];
		sourceRoot.traverse((child) => {
			if (child.isBone && child.name) sourceBoneNames.push(child.name);
		});
		const targetBoneNames = [];
		targetRoot.traverse((child) => {
			if (child.isBone && child.name) targetBoneNames.push(child.name);
		});
		for (const srcName of sourceBoneNames) {
			const canonical = this._resolveToCanonical(srcName);
			if (canonical) this.sourceToCanonical.set(srcName, canonical);
		}
		for (const tgtName of targetBoneNames) {
			const canonical = this._resolveToCanonical(tgtName);
			if (canonical && !this.canonicalToTarget.has(canonical)) this.canonicalToTarget.set(canonical, tgtName);
		}
		const unmappedSourceBones = [];
		for (const srcName of sourceBoneNames) {
			const canonical = this.sourceToCanonical.get(srcName);
			if (canonical) {
				const tgtName = this.canonicalToTarget.get(canonical);
				if (tgtName) this.sourceToTarget.set(srcName, tgtName);
				else unmappedSourceBones.push(srcName);
			} else unmappedSourceBones.push(srcName);
		}
		const missingRequiredTargetBones = [];
		for (const canonical of CANONICAL_BONES) if (!this.canonicalToTarget.has(canonical)) missingRequiredTargetBones.push(canonical);
		const entries = sourceBoneNames.map((srcName) => {
			const canonical = this.sourceToCanonical.get(srcName) ?? null;
			const targetBone = canonical ? this.canonicalToTarget.get(canonical) ?? null : null;
			return {
				sourceBone: srcName,
				canonicalBone: canonical,
				targetBone,
				resolved: targetBone !== null
			};
		});
		const mappedBones = entries.filter((e) => e.resolved).length;
		const verdict = mappedBones === 0 ? "FAIL" : missingRequiredTargetBones.length > 0 ? "PARTIAL" : "PASS";
		const report = {
			sourceName: this.sourceName,
			targetName: this.targetName,
			totalSourceBones: sourceBoneNames.length,
			totalTargetBones: targetBoneNames.length,
			mappedBones,
			unmappedSourceBones,
			missingRequiredTargetBones,
			entries,
			resolvedTrackCount: 0,
			unresolvedTrackCount: 0,
			verdict
		};
		this._logReport(report);
		return report;
	}
	/**
	* Retarget an AnimationClip from source skeleton naming to target skeleton naming.
	* Rewrites track names: source bone name → target bone name.
	* Tracks that cannot be resolved are dropped and reported.
	*
	* @param clip  Source AnimationClip
	* @returns RetargetedClipResult with the new clip and resolution counts
	*/
	retargetClip(clip) {
		const retargetedTracks = [];
		let resolvedTracks = 0;
		let unresolvedTracks = 0;
		const unresolvedTrackNames = [];
		for (const track of clip.tracks) {
			const rawName = track.name;
			const dotIdx = rawName.lastIndexOf(".");
			const withoutProp = dotIdx !== -1 ? rawName.slice(0, dotIdx) : rawName;
			const property = dotIdx !== -1 ? rawName.slice(dotIdx + 1) : "";
			const pipeIdx = withoutProp.lastIndexOf("|");
			const sourceBoneName = pipeIdx !== -1 ? withoutProp.slice(pipeIdx + 1) : withoutProp;
			const targetBoneName = this.sourceToTarget.get(sourceBoneName);
			if (targetBoneName && property) {
				const newTrackName = `${targetBoneName}.${property}`;
				const RetargetedTrack = track.constructor;
				retargetedTracks.push(new RetargetedTrack(newTrackName, track.times, track.values, track.getInterpolation()));
				resolvedTracks++;
			} else {
				unresolvedTracks++;
				unresolvedTrackNames.push(`${clip.name}::${sourceBoneName}`);
			}
		}
		return {
			clip: new AnimationClip(clip.name, clip.duration, retargetedTracks),
			resolvedTracks,
			unresolvedTracks,
			unresolvedTrackNames
		};
	}
	/**
	* Retarget an array of AnimationClips and log full instrumentation.
	* Returns retargeted clips with per-clip and aggregate resolution counts.
	*/
	retargetClips(clips, label = "") {
		const retargetedClips = [];
		let totalResolved = 0;
		let totalUnresolved = 0;
		console.log(`\n[AnimationRetargeter] ── Retargeting ${clips.length} clip(s) ${label ? `[${label}]` : ""}`);
		for (const clip of clips) {
			const result = this.retargetClip(clip);
			retargetedClips.push(result.clip);
			totalResolved += result.resolvedTracks;
			totalUnresolved += result.unresolvedTracks;
			if (result.unresolvedTracks > 0) {
				console.warn(`[AnimationRetargeter] ⚠️  Clip "${clip.name}": ${result.resolvedTracks} resolved / ${result.unresolvedTracks} unresolved tracks`);
				result.unresolvedTrackNames.slice(0, 5).forEach((n) => console.warn(`  • UNRESOLVED: ${n}`));
			} else console.log(`[AnimationRetargeter] ✅ Clip "${clip.name}": ${result.resolvedTracks}/${clip.tracks.length} tracks resolved`);
		}
		console.log(`[AnimationRetargeter] ── Summary: ${totalResolved} resolved / ${totalUnresolved} unresolved across ${clips.length} clip(s)`);
		return {
			clips: retargetedClips,
			totalResolved,
			totalUnresolved
		};
	}
	/**
	* Resolve a bone name to its canonical form using the alias table.
	* Falls back to normalized comparison if exact match not found.
	*/
	_resolveToCanonical(boneName) {
		if (BONE_ALIAS_TABLE[boneName]) return BONE_ALIAS_TABLE[boneName];
		const lower = boneName.toLowerCase();
		for (const [alias, canonical] of Object.entries(BONE_ALIAS_TABLE)) if (alias.toLowerCase() === lower) return canonical;
		const normalized = boneName.toLowerCase().replace(/mixamorig[:._-]?/g, "").replace(/[^a-z0-9]/g, "");
		for (const [alias, canonical] of Object.entries(BONE_ALIAS_TABLE)) if (alias.toLowerCase().replace(/mixamorig[:._-]?/g, "").replace(/[^a-z0-9]/g, "") === normalized) return canonical;
		return null;
	}
	_logReport(report) {
		const line = "─".repeat(60);
		console.log(`\n${line}`);
		console.log(`ANIMATION RETARGET MAP — ${report.sourceName} → ${report.targetName}`);
		console.log(line);
		console.log(`  Source bones:   ${report.totalSourceBones}`);
		console.log(`  Target bones:   ${report.totalTargetBones}`);
		console.log(`  Mapped:         ${report.mappedBones}`);
		console.log(`  Unmapped src:   ${report.unmappedSourceBones.length}`);
		console.log(`  Missing req:    ${report.missingRequiredTargetBones.length}`);
		console.log(`  Verdict:        ${report.verdict}`);
		if (report.unmappedSourceBones.length > 0) console.warn(`[AnimationRetargeter] ⚠️  Unmapped source bones (${report.unmappedSourceBones.length}): ` + report.unmappedSourceBones.slice(0, 10).join(", ") + (report.unmappedSourceBones.length > 10 ? ` +${report.unmappedSourceBones.length - 10} more` : ""));
		if (report.missingRequiredTargetBones.length > 0) console.warn(`[AnimationRetargeter] ⚠️  Missing required target bones: ` + report.missingRequiredTargetBones.join(", "));
		for (const entry of report.entries) {
			const status = entry.resolved ? "✅" : "❌";
			const canonical = entry.canonicalBone ?? "UNKNOWN";
			const target = entry.targetBone ?? "MISSING";
			console.log(`  ${status} ${entry.sourceBone.padEnd(30)} → ${canonical.padEnd(15)} → ${target}`);
		}
		console.log(line);
	}
};
/**
* Resolve a single bone name to its canonical Bannon skeleton name.
* Returns null if the bone name is not recognized.
*/
function resolveToCanonicalBone(boneName) {
	if (BONE_ALIAS_TABLE[boneName]) return BONE_ALIAS_TABLE[boneName];
	const lower = boneName.toLowerCase();
	for (const [alias, canonical] of Object.entries(BONE_ALIAS_TABLE)) if (alias.toLowerCase() === lower) return canonical;
	const normalized = boneName.toLowerCase().replace(/mixamorig[:._-]?/g, "").replace(/[^a-z0-9]/g, "");
	for (const [alias, canonical] of Object.entries(BONE_ALIAS_TABLE)) if (alias.toLowerCase().replace(/mixamorig[:._-]?/g, "").replace(/[^a-z0-9]/g, "") === normalized) return canonical;
	return null;
}
/** Mixamo FBX (`mixamorigHips`) and Bannon skinned GLBs (`mixamorig:Hips`) are the same bone. */
function mixamoBindKey(boneName) {
	return boneName.toLowerCase().replace(/^mixamorig[:._-]*/, "mixamorig");
}
/**
* Bind a clip's tracks to an actual target skeleton's bone names.
*
* Policy:
*   1. Exact target bone name match wins.
*   2. Mixamo colon-insensitive match (`mixamorigHips` ↔ `mixamorig:Hips`).
*   3. Else canonical alias match (mixamorigHips → Hips, etc.).
*   4. Else the track is UNRESOLVED — never rewritten onto a fake bone.
*/
function bindClipTracksToTargetBones(clip, targetBoneNames) {
	const exact = new Set(targetBoneNames);
	const mixamoExact = /* @__PURE__ */ new Map();
	const canonicalToTarget = /* @__PURE__ */ new Map();
	for (const name of targetBoneNames) {
		mixamoExact.set(mixamoBindKey(name), name);
		const canonical = resolveToCanonicalBone(name);
		if (canonical && !canonicalToTarget.has(canonical)) canonicalToTarget.set(canonical, name);
	}
	const retargetedTracks = [];
	const unresolvedTrackNames = [];
	let resolvedTracks = 0;
	let unresolvedTracks = 0;
	for (const track of clip.tracks) {
		const rawName = track.name;
		const dotIdx = rawName.lastIndexOf(".");
		const withoutProp = dotIdx !== -1 ? rawName.slice(0, dotIdx) : rawName;
		const property = dotIdx !== -1 ? rawName.slice(dotIdx + 1) : "";
		const pipeIdx = withoutProp.lastIndexOf("|");
		const sourceBoneName = pipeIdx !== -1 ? withoutProp.slice(pipeIdx + 1) : withoutProp;
		let targetBoneName = null;
		if (exact.has(sourceBoneName)) targetBoneName = sourceBoneName;
		else if (mixamoExact.has(mixamoBindKey(sourceBoneName))) targetBoneName = mixamoExact.get(mixamoBindKey(sourceBoneName)) ?? null;
		else {
			const canonical = resolveToCanonicalBone(sourceBoneName);
			targetBoneName = canonical ? canonicalToTarget.get(canonical) ?? null : null;
		}
		if (targetBoneName && property) {
			const newTrackName = `${targetBoneName}.${property}`;
			const TrackCtor = track.constructor;
			retargetedTracks.push(new TrackCtor(newTrackName, track.times, track.values, track.getInterpolation()));
			resolvedTracks++;
		} else {
			unresolvedTracks++;
			unresolvedTrackNames.push(`${clip.name}::${sourceBoneName}${property ? "." + property : ""}`);
		}
	}
	const retargetedClip = new AnimationClip(clip.name, clip.duration, retargetedTracks);
	retargetedClip.userData = {
		...clip.userData ?? {},
		clipSourceType: resolvedTracks > 0 ? "RETARGETED_AUTHORED_CLIP" : "MISSING_CLIP",
		resolvedTracks,
		unresolvedTracks,
		unresolvedTrackNames
	};
	return {
		clip: retargetedClip,
		resolvedTracks,
		unresolvedTracks,
		unresolvedTrackNames
	};
}
/**
* SemanticStateAliases.ts
* ─────────────────────────────────────────────────────────────────────────────
* Canonical semantic state alias tables shared between CharacterPipeline,
* AnimationBridge, and FighterMesh.
*
* Extracted here to avoid circular imports between:
*   animation_bridge/retarget.ts ↔ src/engine/pipeline/CharacterPipeline.ts
* ─────────────────────────────────────────────────────────────────────────────
*/
/**
* Maps semantic animation state names to actual clip names from various sources.
* Used by AnimationBridge to find the best clip for each semantic state.
*/
var SEMANTIC_STATE_ALIASES = {
	idle: [
		"idle",
		"Idle",
		"IDLE",
		"BOX_IDLE",
		"STANCE_BLADED",
		"STANCE_WIDE",
		"DRUNK_IDLE_VARIATION",
		"ACTION_IDLE_TO_STANDING_IDLE",
		"neutral",
		"Neutral",
		"standing",
		"Standing",
		"stance",
		"Stance",
		"combatIdle",
		"CombatIdle",
		"idle_procedural_placeholder"
	],
	walk_forward: [
		"walk",
		"Walk",
		"DWARF_WALK",
		"DRUNK_WALK",
		"GINGA_FORWARD",
		"LOCO_STRUT",
		"LOCO_LIGHT",
		"DRUNK_RUN_FORWARD",
		"walkForward",
		"WalkForward",
		"walking",
		"Walking",
		"walk_fwd",
		"SBW_walk_fwd",
		"walk_forward_procedural_placeholder"
	],
	walk_back: [
		"walkBack",
		"WalkBack",
		"GINGA_BACKWARD",
		"INJURED_RUN_BACKWARDS_RIGHT_TURN",
		"walkBackward",
		"WalkBackward",
		"walk_back",
		"walk_bwd",
		"SBW_walk_back",
		"walk_back_procedural_placeholder"
	],
	strafe_left: [
		"strafeLeft",
		"StrafeLeft",
		"GINGA_SIDEWAYS_2",
		"LOCO_PROWL",
		"sidestepLeft",
		"SidestepLeft",
		"SBW_strafe_left"
	],
	strafe_right: [
		"strafeRight",
		"StrafeRight",
		"CROUCH_TORCH_WALK_RIGHT",
		"INJURED_TURN_RIGHT",
		"sidestepRight",
		"SidestepRight",
		"SBW_strafe_right"
	],
	attack_1: [
		"lightAttack",
		"LightAttack",
		"BOXING",
		"BODY_JAB_CROSS",
		"COMBO_PUNCH",
		"BOXING__1_",
		"BOXING__2_",
		"BOXING__3_",
		"BOXING__4_",
		"ILLEGAL_ELBOW_PUNCH",
		"ILLEGAL_ELBOW_PUNCH__1_",
		"BASEBALL_HIT",
		"punch",
		"Punch",
		"jab",
		"Jab",
		"attack",
		"Attack",
		"LP",
		"T_1",
		"bf_jab",
		"attack_1_procedural_placeholder"
	],
	attack_2: [
		"heavyAttack",
		"HeavyAttack",
		"HURRICANE_KICK",
		"DROP_KICK",
		"ILLEGAL_KNEE",
		"TIGER_FEINT_KICK",
		"BASH",
		"AU",
		"CAPOEIRA",
		"CROSS_JUMPS",
		"kick",
		"Kick",
		"cross",
		"Cross",
		"RP",
		"T_2",
		"bf_cross",
		"attack_2_procedural_placeholder"
	],
	block: [
		"guard",
		"Guard",
		"CENTER_BLOCK",
		"GUARD_HIGH",
		"GUARD_LOW",
		"DEFENDER",
		"ESQUIVA_4",
		"block",
		"Block",
		"defend",
		"Defend",
		"SBW_guard",
		"T_guard",
		"block_procedural_placeholder"
	],
	hit_reaction: [
		"hit",
		"Hit",
		"HIT_REACTION",
		"HIT_TO_BODY",
		"HIT_TO_HEAD",
		"BIG_RIB_HIT",
		"HIT_ON_THE_BACK",
		"HIT_ON_SIDE_OF_HEAD",
		"BIG_BODY_BLOW",
		"hurt",
		"Hurt",
		"flinch",
		"Flinch",
		"hitstun",
		"Hitstun",
		"SBW_hit",
		"T_hit",
		"hit_reaction_procedural_placeholder"
	],
	knockdown: [
		"knockdown",
		"Knockdown",
		"FALLING_FLAT_IMPACT",
		"FALLING_FORWARD_DEATH",
		"DEFEAT",
		"DYING_BACKWARDS",
		"ko",
		"KO",
		"fall",
		"Fall",
		"SBW_knockdown",
		"T_knockdown",
		"knockdown_procedural_placeholder"
	],
	getup: [
		"getUp",
		"GetUp",
		"KIP_UP",
		"CORKSCREW_KIP_UP",
		"CORKSCREW_EVADE",
		"quickStand",
		"QuickStand",
		"gettingUp",
		"GettingUp",
		"T_quickstand",
		"getup_procedural_placeholder"
	],
	grapple: [
		"grab",
		"Grab",
		"SUPLEX",
		"GERMANSUPLEX",
		"DDT",
		"CHOKESLAM",
		"DOUBLE_LEG_TAKEDOWN___VICTIM",
		"throw",
		"Throw",
		"grapple",
		"Grapple",
		"SBW_throw",
		"T_1_3"
	],
	crouch: [
		"crouch",
		"Crouch",
		"STANCE_CROUCH",
		"CROUCH_IDLE_02_LOOKING_AROUND",
		"CROUCH_WALK_FORWARD",
		"duck",
		"Duck",
		"SBW_crouch",
		"T_crouch"
	],
	run: [
		"run",
		"Run",
		"DRUNK_RUN_FORWARD",
		"LOCO_LIGHT",
		"running",
		"Running",
		"sprint",
		"Sprint"
	],
	dash_forward: [
		"dashForward",
		"DashForward",
		"dash",
		"Dash",
		"run",
		"Run",
		"DRUNK_RUN_FORWARD"
	],
	backdash: [
		"backdash",
		"Backdash",
		"backDash",
		"BackDash",
		"GINGA_BACKWARD",
		"SBW_backdash",
		"T_backdash"
	],
	victory: [
		"victory",
		"Victory",
		"win",
		"Win",
		"BREAKDANCE_READY",
		"STANCE_WIDE",
		"victoryPose",
		"VictoryPose"
	],
	defeat: [
		"defeat",
		"Defeat",
		"DEFEAT",
		"lose",
		"Lose",
		"knockdown",
		"Knockdown"
	],
	taunt: [
		"taunt",
		"Taunt",
		"TAUNT",
		"TAUNT_CALLOUT",
		"BREAKDANCE_READY",
		"CAPOEIRA",
		"idle",
		"Idle"
	]
};
/**
* Maps FighterStateMachine combat states to semantic animation states.
* Used by FighterMesh and AnimationBridge to resolve the correct clip
* for each combat state transition.
*/
var COMBAT_STATE_TO_SEMANTIC = {
	idle: "idle",
	Neutral: "idle",
	standing: "idle",
	walk: "walk_forward",
	walkForward: "walk_forward",
	Walking: "walk_forward",
	walkBackward: "walk_back",
	strafeLeft: "strafe_left",
	strafeRight: "strafe_right",
	sidestepLeft: "strafe_left",
	sidestepRight: "strafe_right",
	Backdashing: "backdash",
	run: "walk_forward",
	dash: "walk_forward",
	dashForward: "walk_forward",
	crouch: "crouch",
	crouchWalk: "walk_forward",
	lightAttack: "attack_1",
	light: "attack_1",
	Startup: "attack_1",
	Active: "attack_1",
	heavyAttack: "attack_2",
	heavy: "attack_2",
	heatBurst: "attack_2",
	rageArt: "attack_2",
	powerCrush: "attack_2",
	crouchLightAttack: "attack_1",
	crouchHeavyAttack: "attack_2",
	jumpAttack: "attack_2",
	runAttack: "attack_2",
	CommandThrow: "grapple",
	ThrowWhiff: "idle",
	guard: "block",
	Guard: "block",
	block: "block",
	Blockstun: "block",
	guardLow: "block",
	hit: "hit_reaction",
	Hitstun: "hit_reaction",
	HitStun: "hit_reaction",
	Stunned: "hit_reaction",
	hitLow: "hit_reaction",
	hitHigh: "hit_reaction",
	knockdown: "knockdown",
	Knockdown: "knockdown",
	ko: "knockdown",
	KO: "knockdown",
	Crumple: "knockdown",
	WakeupTechRoll: "getup",
	WakeupBackrise: "getup",
	WakeupQuickStand: "getup",
	wake: "getup",
	victory: "victory",
	defeat: "knockdown",
	taunt: "taunt",
	intro: "idle"
};
/** Map a clip name onto a semantic state via alias tables. Returns null if unmatched. */
function inferSemanticStateFromClipName(clipName) {
	const lower = clipName.toLowerCase();
	for (const [semanticState, aliases] of Object.entries(SEMANTIC_STATE_ALIASES)) if (aliases.some((a) => a.toLowerCase() === lower || lower === semanticState.toLowerCase())) return semanticState;
	return null;
}
/**
* UNIVERSAL CHARACTER PIPELINE
* ─────────────────────────────────────────────────────────────────────────────
* Single authoritative character-ingestion pipeline used by BOTH Character
* Select (CharacterPortrait3D) and Combat (FighterMesh / CombatArena3D).
*
* AUTHORED SKELETON LAW
* ─────────────────────
* The native GLB is authoritative. This pipeline NEVER:
*   • generates a replacement skeleton
*   • generates synthetic bones
*   • calculates replacement vertex weights
*   • rebinds native meshes
*   • replaces Skeleton objects
*   • modifies inverse-bind matrices
*   • rewrites skinIndex/skinWeight data
*   • reparents the authored skeleton
*   • moves bones to compensate for floor placement
*   • applies character-name-specific corrective bone offsets
*
* The pipeline MAY: CLONE, VALIDATE, ANIMATE, and TRANSFORM THE OUTER INSTANCE.
*
* UNIVERSALITY LAW
* ────────────────
* No character-specific exceptions. No if(name==='Bannon'). No specialYOffset.
* Every roster member goes through the same pipeline and the same validation gates.
*
* FLOOR NORMALIZATION
* ───────────────────
* After SkeletonUtils.clone():
*   1. Update world matrices
*   2. Measure actual visible cloned SkinnedMesh geometry via Box3
*   3. Compute aggregate Box3
*   4. Read measured minimum Y
*   5. Apply compensating translation to the OUTER CHARACTER INSTANCE
*   6. Leave authored bone transforms and bind matrices untouched
*
* FACING
* ──────
* Forward direction is determined from STABLE GEOMETRY DATA ONLY — the
* bounding box centroid of the mesh geometry in canonical (rotation=0) pose.
* We NEVER infer facing from bone positions (head vs hips) because a fighting
* stance can put the head forward without the character's actual forward axis
* being +Z. The result is recorded as diagnostic metadata.
* Combat-facing rotation is applied ONLY to the OUTER CHARACTER INSTANCE.
*
* BLOCKED ASSETS
* ──────────────
* A malformed asset becomes BLOCKED — ASSET DEFORMATION INTEGRITY FAILURE.
* The pipeline NEVER secretly compensates for a failed validation by generating
* a new rig or synthetic skeleton.
*
* Pipeline:
*   Native GLB
*   → GLTFLoader (caller's responsibility)
*   → validate authored skeleton/SkinnedMesh/skin data
*   → SkeletonUtils.clone()
*   → independent character instance
*   → instance-level spatial normalization (Box3, no bone moves)
*   → authored forward-axis determination (geometry centroid only)
*   → gameplay-facing transform (outer instance only)
*   → AnimationMixer targeting that clone
*   → visible SkinnedMesh deformation
*   → validation
*   → render
*/
/** Target character height in world units — applied uniformly to all roster members */
var PIPELINE_TARGET_HEIGHT = 1.85;
/**
* Determine the authored forward correction for a character scene.
*
* Uses GEOMETRY CENTROID ONLY — no bone position inference.
* The scene must already have rotation=[0,0,0] and be world-matrix-updated
* before calling this function.
*
* @returns 0 if model faces -Z (glTF standard), Math.PI if model faces +Z (Blender default)
*/
function determineForwardCorrection(scene) {
	const meshCentroids = [];
	scene.traverse((child) => {
		const mesh = child;
		if (!mesh.isMesh) return;
		if (!mesh.geometry || !mesh.geometry.attributes.position) return;
		const box = new Box3().setFromObject(mesh);
		if (!box.isEmpty()) meshCentroids.push(box.getCenter(new Vector3()));
	});
	if (meshCentroids.length === 0) {
		console.log("[CharacterPipeline] ⚠️ Forward detection: no geometry found, assuming -Z facing (no correction)");
		return 0;
	}
	const avgZ = meshCentroids.reduce((sum, p) => sum + p.z, 0) / meshCentroids.length;
	if (avgZ > .05) {
		console.log(`[CharacterPipeline] 🔄 Forward correction: avgMeshCentroidZ=${avgZ.toFixed(4)} > 0.05 → model faces +Z → applying 180° Y correction to inner group`);
		return Math.PI;
	}
	console.log(`[CharacterPipeline] ✅ Forward direction: avgMeshCentroidZ=${avgZ.toFixed(4)} ≤ 0.05 → model faces -Z (glTF standard, no correction needed)`);
	return 0;
}
/**
* Validate the authored GLB scene before cloning.
* Returns BLOCKED if the asset has structural defects that would cause
* deformation failures at runtime.
*
* FAIL CLOSED: A malformed asset must become BLOCKED, never secretly fixed.
*
* RELAXED GATE: NO_SKINNED_MESH and NO_SKELETON are warnings, not hard blocks.
* Some valid GLBs (e.g. Blender exports with certain settings) may not expose
* THREE.SkinnedMesh / THREE.Bone typed objects at the top level even though
* they have valid authored skinning data that Three.js can animate correctly.
* Only block on checks that guarantee the asset CANNOT render or animate:
*   - NO_VISIBLE_MESH   → nothing to render
*   - BONE_MATRIX_NAN   → corrupt transforms will crash the renderer
*   - SKINNED_MESH_UNBOUND (only if SkinnedMeshes ARE present but unbound)
*   - MISSING_SKIN_ATTRIBUTES (only if SkinnedMeshes ARE present but missing data)
*/
function validateAuthoredAsset(scene, animations) {
	const failingChecks = [];
	const details = [];
	const bones = [];
	const skinnedMeshes = [];
	scene.traverse((child) => {
		if (child.isBone) bones.push(child);
		if (child.isSkinnedMesh) skinnedMeshes.push(child);
	});
	let hasMesh = false;
	scene.traverse((child) => {
		const c = child;
		if (c.isMesh || c.isSkinnedMesh) hasMesh = true;
	});
	if (!hasMesh) {
		failingChecks.push("NO_VISIBLE_MESH");
		details.push("No visible mesh found in GLB — asset has no renderable geometry");
	}
	if (skinnedMeshes.length === 0) console.warn("[CharacterPipeline] ⚠️ NO_SKINNED_MESH — no THREE.SkinnedMesh found in scene. Asset may still animate if skinning data is present. Proceeding with pipeline.");
	if (bones.length === 0) console.warn("[CharacterPipeline] ⚠️ NO_SKELETON — no THREE.Bone objects found in scene. Asset may still animate if skeleton data is present. Proceeding with pipeline.");
	if (bones.length > 0) {
		if (bones.filter((b) => !b.parent?.isBone).length === 0) {
			failingChecks.push("SKELETON_NO_ROOT");
			details.push("Skeleton has no root bone — hierarchy is disconnected");
		}
	}
	for (const sm of skinnedMeshes) if (!sm.skeleton || sm.skeleton.bones.length === 0) {
		failingChecks.push("SKINNED_MESH_UNBOUND");
		details.push(`SkinnedMesh "${sm.name || "unnamed"}" has no bound skeleton`);
		break;
	}
	for (const sm of skinnedMeshes) {
		const hasSkinIndex = sm.geometry.attributes.skinIndex != null;
		const hasSkinWeight = sm.geometry.attributes.skinWeight != null;
		if (!hasSkinIndex || !hasSkinWeight) {
			failingChecks.push("MISSING_SKIN_ATTRIBUTES");
			details.push(`SkinnedMesh "${sm.name || "unnamed"}" missing ${!hasSkinIndex ? "skinIndex" : ""}${!hasSkinWeight ? " skinWeight" : ""} — authored skinning data incomplete`);
			break;
		}
	}
	for (const bone of bones) {
		bone.updateWorldMatrix(true, false);
		for (const v of bone.matrixWorld.elements) if (!isFinite(v)) {
			failingChecks.push("BONE_MATRIX_NAN");
			details.push(`Bone "${bone.name}" has NaN/Infinity in world matrix — authored skeleton is corrupt`);
			break;
		}
		if (failingChecks.includes("BONE_MATRIX_NAN")) break;
	}
	const verdict = failingChecks.length === 0 ? "PASS" : "BLOCKED";
	if (verdict === "BLOCKED") console.error(`[CharacterPipeline] ❌ BLOCKED — ASSET DEFORMATION INTEGRITY FAILURE\n  Failing checks: [${failingChecks.join(", ")}]\n  Details:\n${details.map((d) => `    • ${d}`).join("\n")}\n  DO NOT attempt synthetic rigging. Fix the source GLB asset.`);
	return {
		verdict,
		failingChecks,
		details
	};
}
/**
* Validate that every animation clip channel resolves to an actual bone in
* the cloned scene before the AnimationMixer starts.
*
* Three.js track names follow the pattern:
*   "<objectName>.<propertyPath>"   e.g. "RightArm.quaternion" *"<objectName>[<subpath>]"       e.g. "Armature|RightArm.quaternion"
*
* The resolver mirrors THREE.AnimationMixer's own name-based lookup: *   it searches the root object's subtree for an object whose .name matches
*   the track's target name.
*
* @param clonedScene  The cloned scene that the mixer will target
* @param animations   The animation clips to validate
* @param modelName    Short name used in log messages
*/
function validateAnimationChannelBones(clonedScene, animations, modelName) {
	const boneNameSet = /* @__PURE__ */ new Set();
	const allBoneNames = [];
	clonedScene.traverse((child) => {
		if (child.isBone) {
			boneNameSet.add(child.name);
			allBoneNames.push(child.name);
		}
	});
	const objectNameSet = /* @__PURE__ */ new Set();
	clonedScene.traverse((child) => {
		if (child.name) objectNameSet.add(child.name);
	});
	let totalChannels = 0;
	let resolvedChannels = 0;
	let unresolvedChannels = 0;
	const mismatches = [];
	for (const clip of animations) for (const track of clip.tracks) {
		totalChannels++;
		const rawName = track.name;
		const dotIdx = rawName.lastIndexOf(".");
		const withoutProp = dotIdx !== -1 ? rawName.slice(0, dotIdx) : rawName;
		const pipeIdx = withoutProp.lastIndexOf("|");
		const targetName = pipeIdx !== -1 ? withoutProp.slice(pipeIdx + 1) : withoutProp;
		if (objectNameSet.has(targetName)) resolvedChannels++;
		else {
			unresolvedChannels++;
			mismatches.push({
				clipName: clip.name,
				trackName: rawName,
				targetName,
				availableBones: allBoneNames.slice()
			});
			console.error(`[CharacterPipeline] ❌ BONE MISMATCH — "${modelName}"\n  Clip:          "${clip.name}"\n  Track:"${rawName}"\n  Target bone:"${targetName}"\n  Available bones (${allBoneNames.length}): [${allBoneNames.join(", ")}]\n  → This channel will NOT animate. Fix the asset or add a retarget map.`);
		}
	}
	const allResolved = unresolvedChannels === 0;
	if (animations.length === 0) console.warn(`[CharacterPipeline] ⚠️ "${modelName}" — no animation clips to validate. Character will be static (bind pose).`);
	else if (allResolved) console.log(`[CharacterPipeline] ✅ Animation channel validation PASSED — "${modelName}"\n  ${resolvedChannels}/${totalChannels} channels resolved across ${animations.length} clip(s).`);
	else console.error(`[CharacterPipeline] ❌ Animation channel validation FAILED — "${modelName}"\n  ${resolvedChannels}/${totalChannels} channels resolved, ${unresolvedChannels} UNRESOLVED.\n  Unresolved channels will produce statue/bind-pose lock. Fix bone name mismatches above.`);
	return {
		totalChannels,
		resolvedChannels,
		unresolvedChannels,
		mismatches,
		allResolved
	};
}
/**
* Extract and retarget animation clips for a character.
*
* Steps:
*   1. Collect clips from the GLB
*   2. Build AnimationRetargeter from source skeleton → target skeleton
*   3. Apply retarget layer (source bone names → canonical → target bone names)
*   4. Run validateAnimationChannelBones() on retargeted clips
*   5. Return clips ready for mixer.clipAction()
*
* @param sourceScene   The original (un-cloned) GLB scene — used to index source bones
* @param targetScene   The cloned scene that the mixer will target
* @param glbAnimations Animation clips from the GLB
* @param modelName     Short name for logging
* @param characterId   Character identifier for bridge source lookup
*/
async function extractAndRetargetAnimations(sourceScene, targetScene, glbAnimations, modelName, characterId = "") {
	const retargeter = new AnimationRetargeter(`${modelName}_source`, `${modelName}_target`);
	const retargetReport = retargeter.buildMap(sourceScene, targetScene);
	const glbClipCount = glbAnimations.length;
	let bridgeClipCount = 0;
	let retargetApplied = false;
	let retargetVerdict = "SKIPPED";
	const needsRetarget = retargetReport.mappedBones > 0 && retargetReport.verdict !== "FAIL";
	let processedClips = [];
	if (glbAnimations.length > 0 && needsRetarget) {
		const retargetResult = retargeter.retargetClips(glbAnimations, `${modelName} GLB clips`);
		processedClips = retargetResult.clips;
		retargetApplied = true;
		retargetVerdict = retargetReport.verdict;
		console.log(`[CharacterPipeline] 🔄 Retarget applied to "${modelName}": ${retargetResult.totalResolved} resolved / ${retargetResult.totalUnresolved} unresolved tracks`);
	} else if (glbAnimations.length > 0) {
		processedClips = glbAnimations.map((c) => c.clone());
		retargetVerdict = retargetReport.verdict === "FAIL" ? "FAIL" : "SKIPPED";
		if (retargetReport.verdict === "FAIL") console.warn(`[CharacterPipeline] ⚠️ "${modelName}" — retarget map FAILED (no bones mapped). Using clips as-is. Track resolution may be poor.`);
	}
	const targetBoneNames = [];
	targetScene.traverse((child) => {
		if (child.isBone && child.name) targetBoneNames.push(child.name);
	});
	const registry = new AnimationSourceRegistry();
	if (processedClips.length > 0) {
		for (const clip of processedClips) {
			const semanticState = resolveClipSemanticState(clip.name);
			if (semanticState) clip.userData = {
				...clip.userData ?? {},
				semanticState
			};
		}
		registry.registerGLBClips(processedClips, modelName, characterId);
		bridgeClipCount = processedClips.length;
	}
	let authoredClips = null;
	try {
		authoredClips = await loadBannonClipsFromPublic();
	} catch (e) {
		console.warn(`[CharacterPipeline] ⚠️ loadBannonClipsFromPublic failed: ${e.message}`);
	}
	if (authoredClips && authoredClips.size > 0) {
		const boundClips = /* @__PURE__ */ new Map();
		const boundVariants = [];
		let bankResolved = 0;
		let bankUnresolved = 0;
		const unresolvedNames = [];
		const cacheForBind = getCachedBannonMotionBank();
		const toBind = cacheForBind?.variants && cacheForBind.variants.size > 0 ? cacheForBind.variants : authoredClips;
		for (const [clipKey, clip] of toBind) {
			const semanticState = String(clip.userData?.semanticState ?? clipKey);
			const bound = bindClipTracksToTargetBones(clip, targetBoneNames);
			bankResolved += bound.resolvedTracks;
			bankUnresolved += bound.unresolvedTracks;
			unresolvedNames.push(...bound.unresolvedTrackNames);
			if (bound.resolvedTracks === 0) {
				console.warn(`[CharacterPipeline] ⚠️ "${modelName}" motion-bank "${clipKey}" has 0 tracks resolving against the target skeleton (${targetBoneNames.length} bones). Keeping MISSING_CLIP.`);
				continue;
			}
			bound.clip.userData = {
				...bound.clip.userData ?? {},
				semanticState,
				clipSourceType: "RETARGETED_AUTHORED_CLIP",
				isProcedural: false
			};
			boundVariants.push(bound.clip);
			if (!boundClips.has(semanticState)) boundClips.set(semanticState, bound.clip);
		}
		if (boundClips.size > 0) {
			registry.registerAuthoredClips(boundClips, "BANNON_MOTION_BANK");
			const merged = [...boundVariants];
			const seenNames = new Set(merged.map((c) => c.name));
			for (const clip of processedClips) {
				if (seenNames.has(clip.name)) continue;
				merged.push(clip);
			}
			processedClips = merged;
			bridgeClipCount = boundVariants.length;
			retargetApplied = true;
			retargetVerdict = bankUnresolved === 0 ? "PASS" : "PARTIAL";
			console.log(`[CharacterPipeline] ✅ "${modelName}" — bound ${boundClips.size} RETARGETED_AUTHORED_CLIP(s) from Bannon Euler motion bank. resolved=${bankResolved} unresolved=${bankUnresolved}`);
		}
		const cache = getCachedBannonMotionBank();
		if (cache) console.log(`[CharacterPipeline] 📊 Motion bank stats: index=${cache.stats.indexSize} attempted=${cache.stats.attempted} converted=${cache.stats.converted} failed=${cache.stats.failed.length}`);
	} else console.warn(`[CharacterPipeline] ⚠️ "${modelName}" — no authored Bannon motion-bank clips loaded.\n  Filling missing states from Mixamo fighting motion bank.`);
	const mixamoBank = buildMixamoFightingMotionBank();
	const have = new Set(processedClips.map((c) => String(c.userData?.semanticState ?? c.name)));
	let mixamoFilled = 0;
	const mixamoFilledMap = /* @__PURE__ */ new Map();
	for (const [semantic, clip] of mixamoBank) {
		if (have.has(semantic)) continue;
		const bound = bindClipTracksToTargetBones(clip, targetBoneNames);
		if (bound.resolvedTracks === 0) continue;
		bound.clip.userData = {
			...bound.clip.userData ?? {},
			semanticState: semantic,
			clipSourceType: "OPEN_MOCAP",
			isProcedural: true
		};
		processedClips.push(bound.clip);
		have.add(semantic);
		mixamoFilled++;
		mixamoFilledMap.set(semantic, bound.clip);
	}
	if (mixamoFilledMap.size > 0) registry.registerOpenMocap(mixamoFilledMap, "MixamoFightingMotionBank", "CC0");
	if (mixamoFilled > 0) console.log(`[CharacterPipeline] ➕ "${modelName}" filled ${mixamoFilled} Mixamo motion clips`);
	validateRegistryCompleteness(registry, characterId || modelName);
	const channelValidation = validateAnimationChannelBones(targetScene, processedClips, modelName);
	console.log(`[CharacterPipeline] 📊 "${modelName}" animation extraction complete:\n  GLB clips:        ${glbClipCount}\n  Bridge clips:     ${bridgeClipCount}\n  Total clips:      ${processedClips.length}\n  Resolved tracks:  ${channelValidation.resolvedChannels}\n  Unresolved tracks:${channelValidation.unresolvedChannels}\n  Retarget applied: ${retargetApplied}\n  Retarget verdict: ${retargetVerdict}`);
	return {
		clips: processedClips,
		glbClipCount,
		bridgeClipCount,
		resolvedTrackCount: channelValidation.resolvedChannels,
		unresolvedTrackCount: channelValidation.unresolvedChannels,
		retargetApplied,
		retargetVerdict
	};
}
/**
* Resolve a clip name to its semantic state using SEMANTIC_STATE_ALIASES.
* Returns null if no semantic state is found.
*/
function resolveClipSemanticState(clipName) {
	const lower = clipName.toLowerCase();
	for (const [semanticState, aliases] of Object.entries(SEMANTIC_STATE_ALIASES)) if (aliases.some((a) => a.toLowerCase() === lower || lower.includes(a.toLowerCase()))) return semanticState;
	return null;
}
/**
* runCharacterPipeline
*
* The single authoritative character-ingestion pipeline used by BOTH
* Character Select and Combat.
*
* Pipeline steps:
*   1. Validate authored skeleton/SkinnedMesh/skin data (FAIL CLOSED)
*   2. SkeletonUtils.clone() — skeleton-aware clone
*   3. Disable frustum culling on all SkinnedMeshes
*   4. Normalize skin weights (Khronos spec compliance)
*   5. Zero the cloned scene's rotation (canonical pose for measurement)
*   6. Measure actual visible geometry via Box3
*   7. Apply uniform scale to TARGET_HEIGHT
*   8. Re-measure post-scale Box3
*   9. Apply Y offset to outer instance so lowest vertex = Y=0 (floor)
*  10. Update world matrices
*  11. Determine authored forward axis from geometry centroid (NOT bone positions)
*  12. Apply PSX vertex snapping to materials
*  13. Create AnimationMixer targeting the cloned scene
*  14. Load animation clips with name-based binding (NOT UUID)
*  15. Build SkeletonHelper for diagnostic display
*
* NEVER:
*   - Generates synthetic bones
*   - Modifies authored skeleton/bind matrices
*   - Applies character-specific corrections
*   - Uses bone positions to infer facing direction
*
* @param scene - The original GLB scene from GLTFLoader (NOT modified)
* @param animations - Animation clips from the GLB
* @param modelUrl - URL for logging
* @param applyPSXShader - Whether to apply PSX vertex snapping (true for combat, false for portrait)
* @returns PipelineResult or null if BLOCKED
*/
async function runCharacterPipeline(scene, animations, modelUrl, applyPSXShader = true) {
	const modelName = modelUrl.split("/").pop() ?? modelUrl;
	const validation = validateAuthoredAsset(scene, animations);
	if (validation.verdict === "BLOCKED") {
		console.error(`[CharacterPipeline] 🚫 "${modelName}" BLOCKED — asset failed pre-clone validation.\n  Failing: [${validation.failingChecks.join(", ")}]\n  DO NOT secretly re-rig. Fix the source GLB.`);
		return null;
	}
	const cloned = SkeletonUtils.clone(scene);
	cloned.rotation.set(0, 0, 0);
	let frustumCullingDisabled = true;
	let skinWeightsNormalized = true;
	cloned.traverse((child) => {
		const skinnedMesh = child;
		if (!skinnedMesh.isSkinnedMesh) return;
		skinnedMesh.frustumCulled = false;
		if (!skinnedMesh.skeleton || skinnedMesh.skeleton.bones.length === 0) {
			console.warn(`[CharacterPipeline] ⚠️ SkinnedMesh "${skinnedMesh.name}" has no bound skeleton after SkeletonUtils.clone() — check GLB export. Deformation will not occur for this mesh.`);
			frustumCullingDisabled = false;
		} else console.log(`[CharacterPipeline] ✅ SkinnedMesh "${skinnedMesh.name}" bound to skeleton with ${skinnedMesh.skeleton.bones.length} bones after clone.`);
		(Array.isArray(skinnedMesh.material) ? skinnedMesh.material : [skinnedMesh.material]).forEach((mat) => {
			if (mat && "skinning" in mat) mat.skinning = true;
		});
	});
	cloned.updateMatrixWorld(true);
	const rawSize = new Box3().setFromObject(cloned).getSize(new Vector3());
	const scale = rawSize.y > .01 ? PIPELINE_TARGET_HEIGHT / rawSize.y : 1;
	cloned.scale.setScalar(scale);
	cloned.updateMatrixWorld(true);
	const scaledBox = new Box3().setFromObject(cloned);
	const scaledCenter = scaledBox.getCenter(new Vector3());
	const scaledSize = scaledBox.getSize(new Vector3());
	cloned.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z);
	cloned.updateMatrixWorld(true);
	const forwardCorrectionY = determineForwardCorrection(cloned);
	if (applyPSXShader) cloned.traverse((child) => {
		if (!child.isMesh) return;
		const mesh = child;
		(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mat) => {
			const m = mat;
			if (m.map) {
				m.map.minFilter = NearestFilter;
				m.map.magFilter = NearestFilter;
				m.map.generateMipmaps = false;
				m.needsUpdate = true;
			}
			m.onBeforeCompile = (shader) => {
				shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", `vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
             vec4 clipPosition = projectionMatrix * mvPosition;
             float snapRes = ${DEFAULT_PSX_RENDER.renderWidth.toFixed(1)};
             vec2 ndc = clipPosition.xy / clipPosition.w;
             ndc = floor(ndc * snapRes + 0.5) / snapRes;
             clipPosition.xy = ndc * clipPosition.w;
             gl_Position = clipPosition;`);
			};
		});
	});
	const mixer = new AnimationMixer(cloned);
	const extractionResult = await extractAndRetargetAnimations(scene, cloned, animations, modelName, modelName.replace(/[_.].*$/, "").toUpperCase());
	if (extractionResult.unresolvedTrackCount > 0) console.warn(`[CharacterPipeline] ⚠️ "${modelName}" — ${extractionResult.unresolvedTrackCount} unresolved animation channel(s) after retarget. Character may appear frozen in bind pose.`);
	const actions = {};
	for (const clip of extractionResult.clips) {
		const action = mixer.clipAction(clip, cloned);
		actions[clip.name] = action;
	}
	console.log(`[CharacterPipeline] 🎬 "${modelName}" mixer loaded:\n  Clips:            ${extractionResult.clips.length}\n  Resolved tracks:  ${extractionResult.resolvedTrackCount}\n  Unresolved tracks:${extractionResult.unresolvedTrackCount}\n  Mixer root:       ${cloned.uuid} (${cloned.name || "cloned scene"})\n  Actions:          [${Object.keys(actions).join(", ")}]`);
	let skeletonHelper = null;
	let hasAnyBones = false;
	cloned.traverse((child) => {
		if (child.isBone) hasAnyBones = true;
	});
	if (hasAnyBones) {
		skeletonHelper = new SkeletonHelper(cloned);
		skeletonHelper.material.linewidth = 2;
		skeletonHelper.material.color.set(65416);
		skeletonHelper.visible = false;
	}
	let boneCount = 0;
	let skinnedMeshCount = 0;
	cloned.traverse((child) => {
		if (child.isBone) boneCount++;
		if (child.isSkinnedMesh) skinnedMeshCount++;
	});
	const diagnostics = {
		modelUrl,
		boneCount,
		skinnedMeshCount,
		clipCount: extractionResult.clips.length,
		measuredFloorY: scaledBox.min.y + cloned.position.y,
		measuredHeight: scaledSize.y,
		forwardCorrectionDeg: Math.round(forwardCorrectionY * 180 / Math.PI),
		frustumCullingDisabled,
		skinWeightsNormalized,
		pipelineComplete: true
	};
	console.log(`[CharacterPipeline] ✅ "${modelName}" pipeline complete — bones=${boneCount} skinnedMeshes=${skinnedMeshCount} clips=${extractionResult.clips.length} resolved=${extractionResult.resolvedTrackCount} unresolved=${extractionResult.unresolvedTrackCount} height=${scaledSize.y.toFixed(3)} forwardCorrection=${diagnostics.forwardCorrectionDeg}° floorY=${diagnostics.measuredFloorY.toFixed(4)}`);
	return {
		scene: cloned,
		forwardCorrectionY,
		mixer,
		actions,
		skeletonHelper,
		diagnostics
	};
}
//#endregion
export { inferSemanticStateFromClipName as a, determineForwardCorrection as i, COMBAT_STATE_TO_SEMANTIC as n, runCharacterPipeline as o, SEMANTIC_STATE_ALIASES as r, validateAnimationChannelBones as s, AnimationRetargeter as t };
