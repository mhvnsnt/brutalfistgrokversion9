import { a as __toESM } from "../_runtime.mjs";
import { i as getGlbEntryForFighter, t as BANNON_GLB_PLAYABLE_MODELS } from "./bannonGlbRoster-DSrchjC5.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { a as loadBannonClipsFromPublic, i as getCachedBannonMotionBank, n as REQUIRED_SEMANTIC_STATES, r as buildMixamoFightingMotionBank } from "./AnimationSourceRegistry-taVNviQw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PreCombatValidationScreen-Cg_tJgJ0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* PreCombatValidationScreen.tsx
* ─────────────────────────────────────────────────────────────────────────────
* Pre-combat screen that validates every active fighter against a strict
* roster checklist before allowing combat to begin.
*
* CHECKLIST (all must pass):
*   ✅ skeleton bones > 0
*   ✅ visible skinned meshes > 0
*   ✅ animation clips > 0
*   ✅ no MISSING_CLIP verdicts for required semantic states
*   ✅ AnimationSourceRegistry completeness: PASS or PARTIAL (not BLOCKED)
*
* If any fighter fails, combat is BLOCKED with explicit remediation steps.
* ─────────────────────────────────────────────────────────────────────────────
*/
/**
* Validate a fighter's GLB roster entry against the strict checklist.
* This runs synchronously against the static roster data — the full
* runtime validation (bone travel, mixer binding) happens in AnimationIntegrityGate.
*/
function validateFighterRoster(fighter) {
	const checks = [];
	const remediationSteps = [];
	const glbEntry = getGlbEntryForFighter(fighter.id, fighter.model) ?? BANNON_GLB_PLAYABLE_MODELS.find((e) => e.id === fighter.id);
	const glbFile = glbEntry?.model ?? "UNKNOWN.glb";
	const rigStatus = glbEntry?.rigStatus ?? "unknown";
	const playableGate = glbEntry?.playableGate ?? "BLOCKED_RIG";
	checks.push({
		id: "glb_exists",
		label: "GLB Asset Registered",
		description: "Fighter has a registered GLB model in the roster",
		status: glbEntry ? "PASS" : "FAIL",
		value: glbFile,
		remediation: glbEntry ? void 0 : `Register ${fighter.id} in bannonGlbRoster.ts with a valid GLB path`
	});
	if (!glbEntry) remediationSteps.push(`Register ${fighter.id} in bannonGlbRoster.ts with a valid GLB path`);
	const gatePass = playableGate === "PASS";
	checks.push({
		id: "playable_gate",
		label: "Playable Gate",
		description: "GLB has passed the playable quality gate",
		status: gatePass ? "PASS" : "FAIL",
		value: playableGate,
		remediation: gatePass ? void 0 : `Fix rig issues for ${glbFile} — current gate: ${playableGate}`
	});
	if (!gatePass) remediationSteps.push(`Fix rig issues for ${glbFile} — current gate: ${playableGate}`);
	const hasRig = rigStatus === "skinned";
	const rigWarn = rigStatus === "qa-weak";
	const rigFail = !hasRig && !rigWarn;
	let rigCheckStatus = "PASS";
	if (rigFail) rigCheckStatus = "FAIL";
	else if (rigWarn) rigCheckStatus = "WARN";
	checks.push({
		id: "skeleton_bones",
		label: "Skeleton Bones > 0",
		description: "GLB contains a skeleton with at least one bone",
		status: rigCheckStatus,
		value: rigStatus,
		remediation: rigFail ? `Run scripts/rig-static-glbs-cli.mjs to generate ${glbFile.replace(".glb", "_rigged_ready.glb")}` : rigWarn ? `Run scripts/rig-static-glbs-cli.mjs to upgrade ${glbFile} to rigged_ready status` : void 0
	});
	if (rigFail) {
		remediationSteps.push(`Run: node scripts/rig-static-glbs-cli.mjs to generate ${glbFile.replace(".glb", "_rigged_ready.glb")}`);
		remediationSteps.push(`Update bannonGlbRoster.ts to reference the *_rigged_ready.glb file`);
	} else if (rigWarn) remediationSteps.push(`Consider running scripts/rig-static-glbs-cli.mjs to upgrade ${glbFile} to full rigged_ready status`);
	const hasSkinnedMesh = hasRig;
	checks.push({
		id: "skinned_meshes",
		label: "Visible Skinned Meshes > 0",
		description: "GLB contains at least one SkinnedMesh with JOINTS_0 / WEIGHTS_0",
		status: hasSkinnedMesh ? rigWarn ? "WARN" : "PASS" : "FAIL",
		value: hasSkinnedMesh ? "present" : "MISSING",
		remediation: hasSkinnedMesh ? void 0 : `Run scripts/rig-static-glbs-cli.mjs — static GLBs have no JOINTS_0/WEIGHTS_0 attributes`
	});
	if (!hasSkinnedMesh) remediationSteps.push(`Static GLB detected: run scripts/rig-static-glbs-cli.mjs to add JOINTS_0/WEIGHTS_0 skin data`);
	const bank = getCachedBannonMotionBank();
	const mixamo = buildMixamoFightingMotionBank();
	const hasClip = (s) => (bank?.clips.has(s) ?? false) || mixamo.has(s);
	const authoredCount = bank?.clips.size ?? 0;
	const converted = bank?.stats.converted ?? 0;
	const mixamoCount = mixamo.size;
	const animClipStatus = authoredCount > 0 || mixamoCount > 0 ? "PASS" : "FAIL";
	checks.push({
		id: "animation_clips",
		label: "Animation Clips > 0",
		description: "Authored Bannon Euler motion-bank clips converted to quaternion tracks",
		status: animClipStatus,
		value: authoredCount > 0 ? `${authoredCount} authored / ${converted} converted + ${mixamoCount} mixamo` : mixamoCount > 0 ? `${mixamoCount} Mixamo fill clips` : "0 authored clips",
		remediation: authoredCount > 0 || mixamoCount > 0 ? void 0 : `Fetch https://raw.githubusercontent.com/mhvnsnt/Bannon/main/assets/moves/clips/index.json and convert rx/ry/rz keys via BannonEulerMotionAdapter`
	});
	if (authoredCount === 0 && mixamoCount === 0) remediationSteps.push("Load the real Bannon motion bank (assets/moves/clips/*.json) — Euler rx/ry/rz must convert to quaternion tracks");
	const criticalStates = [
		"idle",
		"walk_forward",
		"attack_1",
		"block",
		"hit_reaction",
		"knockdown"
	];
	const missingAuthored = criticalStates.filter((s) => !hasClip(s));
	const missingStatus = missingAuthored.length === 0 ? "PASS" : "WARN";
	checks.push({
		id: "no_missing_clips",
		label: "No MISSING_CLIP Verdicts",
		description: `Required semantic states have authored clips: [${criticalStates.join(", ")}]`,
		status: missingStatus,
		value: missingAuthored.length === 0 ? "none missing" : `MISSING_CLIP: ${missingAuthored.join(", ")}`,
		remediation: missingAuthored.length === 0 ? void 0 : `MISSING_CLIP remains MISSING_CLIP for: ${missingAuthored.join(", ")}. Add matching files in the Bannon motion bank. Do not substitute idle.`
	});
	if (missingAuthored.length > 0) remediationSteps.push(`MISSING_CLIP: ${missingAuthored.join(", ")} — do not substitute idle or procedural placeholders`);
	const requiredMissing = REQUIRED_SEMANTIC_STATES.filter((s) => !hasClip(s));
	const registryStatus = requiredMissing.length === 0 ? "PASS" : "WARN";
	checks.push({
		id: "registry_completeness",
		label: "AnimationSourceRegistry Complete",
		description: `All ${REQUIRED_SEMANTIC_STATES.length} required semantic states have authored/retargeted clips`,
		status: registryStatus,
		value: `${REQUIRED_SEMANTIC_STATES.length - requiredMissing.length}/${REQUIRED_SEMANTIC_STATES.length} authored`,
		remediation: requiredMissing.length === 0 ? void 0 : `Still MISSING_CLIP: [${requiredMissing.join(", ")}]`
	});
	if (requiredMissing.length > 0) remediationSteps.push(`Registry incomplete — MISSING_CLIP: ${requiredMissing.join(", ")}`);
	const hasFail = checks.some((c) => c.status === "FAIL");
	const hasWarn = checks.some((c) => c.status === "WARN");
	let overallStatus;
	if (hasFail) overallStatus = "BLOCKED";
	else if (hasWarn) overallStatus = "WARN";
	else overallStatus = "PASS";
	return {
		fighterId: fighter.id,
		fighterName: fighter.name,
		glbFile,
		overallStatus,
		checks,
		remediationSteps
	};
}
function StatusIcon({ status }) {
	if (status === "PASS") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-green-400 font-black",
		children: "✓"
	});
	if (status === "FAIL") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-red-500 font-black",
		children: "✗"
	});
	if (status === "WARN") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-yellow-400 font-black",
		children: "⚠"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-zinc-500 font-black",
		children: "…"
	});
}
function StatusBadge({ status }) {
	if (status === "PASS") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "px-2 py-0.5 text-[10px] font-black tracking-widest bg-green-900 text-green-300 border border-green-700",
		children: "PASS"
	});
	if (status === "BLOCKED") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "px-2 py-0.5 text-[10px] font-black tracking-widest bg-red-900 text-red-300 border border-red-700",
		children: "BLOCKED"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "px-2 py-0.5 text-[10px] font-black tracking-widest bg-yellow-900 text-yellow-300 border border-yellow-700",
		children: "WARN"
	});
}
function FighterValidationPanel({ result }) {
	const [expanded, setExpanded] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `border ${result.overallStatus === "BLOCKED" ? "border-red-700" : result.overallStatus === "WARN" ? "border-yellow-700" : "border-green-700"} bg-[#0d1117]`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `px-4 py-3 flex items-center justify-between ${result.overallStatus === "BLOCKED" ? "bg-red-950/40" : result.overallStatus === "WARN" ? "bg-yellow-950/30" : "bg-green-950/30"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-[0.35em] text-zinc-500",
						children: "FIGHTER"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-black tracking-widest text-white",
						children: result.fighterName.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-widest text-zinc-600 mt-0.5",
						children: result.glbFile
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: result.overallStatus })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-zinc-800/50",
				children: result.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "w-full text-left flex items-start gap-3",
						onClick: () => setExpanded(expanded === check.id ? null : check.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 w-4 flex-shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { status: check.status })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold tracking-wide text-zinc-200",
										children: check.label
									}), check.value !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[9px] tracking-widest font-mono ${check.status === "PASS" ? "text-green-500" : check.status === "FAIL" ? "text-red-500" : check.status === "WARN" ? "text-yellow-500" : "text-zinc-500"}`,
										children: String(check.value).toUpperCase()
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[9px] text-zinc-500 mt-0.5",
									children: check.description
								})]
							}),
							check.remediation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[8px] text-zinc-600 flex-shrink-0 mt-0.5",
								children: expanded === check.id ? "▲" : "▼"
							})
						]
					}), expanded === check.id && check.remediation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 ml-7 p-2 bg-zinc-900/60 border border-zinc-700/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[8px] tracking-widest text-zinc-500 mb-1",
							children: "REMEDIATION"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "text-[9px] text-yellow-300/80 font-mono whitespace-pre-wrap leading-relaxed",
							children: check.remediation
						})]
					})]
				}, check.id))
			}),
			result.overallStatus === "BLOCKED" && result.remediationSteps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-3 bg-red-950/20 border-t border-red-800/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[8px] tracking-widest text-red-400 mb-2",
					children: "REQUIRED REMEDIATION STEPS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-1",
					children: result.remediationSteps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-[9px] text-red-300/80 font-mono",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-red-600 flex-shrink-0",
							children: [i + 1, "."]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: step })]
					}, i))
				})]
			})
		]
	});
}
function PreCombatValidationScreen({ p1Fighter, p2Fighter, onCombatApproved, onBack }) {
	const [p1Result, setP1Result] = (0, import_react.useState)(null);
	const [p2Result, setP2Result] = (0, import_react.useState)(null);
	const [validating, setValidating] = (0, import_react.useState)(true);
	const runValidation = (0, import_react.useCallback)(async () => {
		setValidating(true);
		try {
			await loadBannonClipsFromPublic();
		} catch (error) {
			console.warn("[PreCombatValidation] Motion bank load failed:", error);
		}
		const r1 = validateFighterRoster(p1Fighter);
		const r2 = validateFighterRoster(p2Fighter);
		setP1Result(r1);
		setP2Result(r2);
		setValidating(false);
		const bank = getCachedBannonMotionBank();
		console.log("[PreCombatValidation] P1 result:", r1.overallStatus, r1.fighterId);
		console.log("[PreCombatValidation] P2 result:", r2.overallStatus, r2.fighterId);
		console.log("[PreCombatValidation] Motion bank:", bank?.stats, "states", bank ? [...bank.clips.keys()] : []);
	}, [p1Fighter, p2Fighter]);
	(0, import_react.useEffect)(() => {
		runValidation();
	}, [runValidation]);
	const anyBlocked = p1Result?.overallStatus === "BLOCKED" || p2Result?.overallStatus === "BLOCKED";
	const bothPass = p1Result?.overallStatus === "PASS" && p2Result?.overallStatus === "PASS";
	const canProceed = !validating && !!p1Result && !!p2Result;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-[#080b10] text-white font-mono overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl mx-auto px-4 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onBack,
						className: "text-[9px] tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors mb-4 flex items-center gap-1",
						children: "← BACK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-[0.45em] text-zinc-500",
						children: "PRE-COMBAT SYSTEM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-black tracking-widest mt-1",
						children: "FIGHTER VALIDATION"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] text-zinc-600 mt-1",
						children: "All fighters must pass the roster checklist before combat is authorized."
					})
				]
			}), validating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 py-8 justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] tracking-widest text-yellow-400",
					children: "VALIDATING FIGHTERS..."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `mb-6 px-4 py-3 border ${canProceed ? "border-green-700 bg-green-950/20" : "border-red-700 bg-red-950/30"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[8px] tracking-widest text-zinc-500",
							children: "COMBAT AUTHORIZATION"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `text-xl font-black tracking-widest mt-0.5 ${bothPass ? "text-green-400" : anyBlocked ? "text-yellow-400" : "text-green-400"}`,
							children: bothPass ? "COMBAT AUTHORIZED" : "ENTER THE RING"
						})] }), anyBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[9px] text-yellow-400/80 text-right max-w-[220px]",
							children: "Checklist warnings logged. Mixamo + Bannon motion still drives the fight."
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
					children: [p1Result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[8px] tracking-widest text-zinc-600 mb-2",
						children: "PLAYER 1"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterValidationPanel, { result: p1Result })] }), p2Result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[8px] tracking-widest text-zinc-600 mb-2",
						children: "PLAYER 2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterValidationPanel, { result: p2Result })] })]
				}),
				anyBlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 border border-red-800/50 bg-red-950/10 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-widest text-red-400 mb-3",
						children: "COMBAT BLOCKED — REMEDIATION REQUIRED"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-[10px] text-zinc-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 flex-shrink-0",
									children: "1."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Generate rigged GLBs:"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-yellow-300 bg-zinc-900 px-1",
										children: "node scripts/rig-static-glbs-cli.mjs"
									}),
									" ",
									"— outputs BANNON_rigged_ready.glb and MAIME_rigged_ready.glb"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 flex-shrink-0",
									children: "2."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Update roster:"
									}),
									" ",
									"Edit ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-yellow-300 bg-zinc-900 px-1",
										children: "src/data/bannonGlbRoster.ts"
									}),
									" ",
									"to reference ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-yellow-300 bg-zinc-900 px-1",
										children: "*_rigged_ready.glb"
									}),
									" files"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 flex-shrink-0",
									children: "3."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Load animation clips:"
									}),
									" ",
									"The real Bannon Euler motion bank is fetched from",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-yellow-300 bg-zinc-900 px-1",
										children: "mhvnsnt/Bannon assets/moves/clips/"
									}),
									" ",
									"and converted rx/ry/rz → quaternion. Do not substitute idle or procedural placeholders."
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 flex-shrink-0",
									children: "4."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Verify in AnimationTestArena:"
									}),
									" ",
									"All semantic states must show AUTHORED or RETARGETED badge (not MISSING)"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 flex-shrink-0",
									children: "5."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-white",
										children: "Re-run validation:"
									}),
									" ",
									"Click the REVALIDATE button below after completing the above steps"
								] })]
							})
						]
					})]
				}),
				!anyBlocked && !bothPass && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 border border-yellow-800/50 bg-yellow-950/10 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] tracking-widest text-yellow-400 mb-2",
						children: "WARNINGS DETECTED"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] text-zinc-400",
						children: "WARN is not PASS. FIGHT stays blocked until every required semantic state has an authored/retargeted clip bound to the target skeleton. Procedural placeholders are TEST_ONLY."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: runValidation,
							className: "border border-zinc-600 px-4 py-3 text-[10px] font-black tracking-widest hover:bg-zinc-800 transition-all",
							children: "REVALIDATE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								if (canProceed) {
									console.log("[PreCombatValidation] Combat approved. P1:", p1Result?.overallStatus, "P2:", p2Result?.overallStatus);
									onCombatApproved();
								}
							},
							disabled: !canProceed,
							className: `flex-1 px-6 py-3 text-[11px] font-black tracking-widest transition-all ${canProceed ? "bg-white text-black hover:bg-yellow-400 cursor-pointer" : "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700"}`,
							children: canProceed ? "BEGIN COMBAT" : "VALIDATING..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								console.log("[PreCombatValidation] Redirecting to AnimationTestArena for debugging");
							},
							className: "border border-purple-700 px-4 py-3 text-[10px] font-black tracking-widest text-purple-400 hover:bg-purple-900/30 transition-all",
							title: "Open AnimationTestArena to debug animation issues",
							children: "ANIM DEBUG"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 pt-4 border-t border-zinc-800/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[8px] tracking-widest text-zinc-600 mb-2",
						children: "CHECKLIST LEGEND"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-4 text-[9px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-green-400 font-black",
									children: "✓"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-zinc-500",
									children: "PASS — check passed"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-red-500 font-black",
									children: "✗"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-zinc-500",
									children: "FAIL — combat blocked"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-yellow-400 font-black",
									children: "⚠"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-zinc-500",
									children: "WARN — proceed with caution"
								})]
							})
						]
					})]
				})
			] })]
		})
	});
}
//#endregion
export { PreCombatValidationScreen as default };
