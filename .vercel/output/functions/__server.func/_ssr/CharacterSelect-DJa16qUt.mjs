import { a as __toESM } from "../_runtime.mjs";
import { a as getPlayableAttires, o as resolveGlbUrl } from "./bannonGlbRoster-DSrchjC5.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/@react-three/drei+[...].mjs";
import { a as dynamic, c as getAllBannonFighters, l as getBannonFighter } from "./routes-ClavP_F3.mjs";
import { i as getCharacterMoveSet } from "./CharacterMoveSetSystem-CtkEuY0E.mjs";
import { n as getSelectMugOverride } from "./pixelate-BHnHyi5M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CharacterSelect-DJa16qUt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MoveSetCustomizer = dynamic(() => import("./MoveSetCustomizer-BY9hWOg-.mjs"), { ssr: false });
var CharacterPortrait3D = dynamic(() => import("./CharacterPortrait3D-XM7dlDl0.mjs"), { ssr: false });
var FACTION_COLOR = {
	alliance: "#1d4ed8",
	corporate: "#dc2626",
	chaos: "#7c3aed",
	independent: "#d97706"
};
var FACTION_BG = {
	alliance: "from-blue-950 to-blue-900",
	corporate: "from-red-950 to-red-900",
	chaos: "from-purple-950 to-purple-900",
	independent: "from-yellow-950 to-yellow-900"
};
/** Deduplicated character list — one entry per unique character id */
function getUniqueCharacters(fighters) {
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const f of fighters) if (!seen.has(f.id)) {
		seen.add(f.id);
		result.push(f);
	}
	return result;
}
/** Get all attires for a character from the GLB roster */
function getCharacterAttires(characterId) {
	const entries = getPlayableAttires(characterId);
	if (entries.length === 0) return [];
	return entries.map((e) => ({
		attire: e.attire ?? "Default",
		model: e.model,
		portraitUrl: resolveGlbUrl(e.model, e.overrideUrl)
	}));
}
function FighterPortrait({ fighter, attirePortraitUrl, slot, active }) {
	const isP1 = slot === "P1";
	if (!fighter) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative flex flex-col items-center justify-end h-full w-full overflow-hidden`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-10",
				style: { backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-col items-center justify-center h-full w-full gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-28 h-40 md:w-40 md:h-56 bg-zinc-800 rounded-sm opacity-60",
					style: { clipPath: "polygon(20% 0%, 80% 0%, 100% 15%, 100% 85%, 80% 100%, 20% 100%, 0% 85%, 0% 15%)" }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-zinc-500 font-mono text-xs tracking-[0.3em] animate-pulse",
					children: isP1 ? "SELECT FIGHTER" : "PUSH P2 START"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `absolute top-3 ${isP1 ? "left-3" : "right-3"} z-20`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-xs font-black tracking-[0.3em] px-2 py-1 border ${isP1 ? "border-blue-600 text-blue-400 bg-blue-950/60" : "border-red-600 text-red-400 bg-red-950/60"}`,
					children: slot
				})
			})
		]
	});
	const factionBg = FACTION_BG[fighter.factionAlignment];
	const factionColor = FACTION_COLOR[fighter.factionAlignment];
	const concept = getSelectMugOverride(fighter.id) ?? fighter.conceptArtUrl ?? fighter.gridPortrait ?? `/portraits/concept/${fighter.id}.png`;
	const portraitUrl = attirePortraitUrl ?? fighter.portraitUrl;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex flex-col items-center justify-end h-full w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 bg-gradient-to-b ${factionBg}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-10 pointer-events-none",
				style: { backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 animate-pulse opacity-20 pointer-events-none",
				style: { background: `radial-gradient(ellipse at center, ${factionColor}55 0%, transparent 70%)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-[1]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: concept,
					alt: "",
					draggable: false,
					className: "h-full w-full object-cover object-top",
					style: { imageRendering: "auto" }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterPortrait3D, {
					modelUrl: portraitUrl,
					factionColor,
					mode: "bust",
					rotationY: isP1 ? -.45 : Math.PI
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-20 w-full flex justify-center pb-2 pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-zinc-400 font-mono text-[9px] tracking-[0.25em] uppercase bg-black/50 px-2 py-0.5",
					children: fighter.role.split("/")[0].trim()
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `absolute top-3 ${isP1 ? "left-3" : "right-3"} z-30`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-xs font-black tracking-[0.3em] px-2 py-1 border ${isP1 ? "border-blue-500 text-blue-300 bg-blue-950/80" : "border-red-500 text-red-300 bg-red-950/80"}`,
					children: slot
				})
			}),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 pointer-events-none border-2 animate-pulse",
				style: { borderColor: factionColor }
			})
		]
	});
}
function AttireSelector({ characterId, selectedAttire, onSelectAttire, slot }) {
	const attires = (0, import_react.useMemo)(() => getCharacterAttires(characterId), [characterId]);
	if (attires.length <= 1) return null;
	const isP1 = slot === "P1";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex gap-1 px-2 py-1 ${isP1 ? "justify-start" : "justify-end"}`,
		children: attires.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => onSelectAttire(a.attire, a.portraitUrl),
			className: `text-[8px] font-mono px-2 py-0.5 border transition-all truncate max-w-[80px] ${selectedAttire === a.attire ? isP1 ? "border-blue-500 text-blue-300 bg-blue-950/60" : "border-red-500 text-red-300 bg-red-950/60" : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`,
			title: a.attire,
			children: a.attire.toUpperCase()
		}, a.model))
	});
}
function RosterSlot({ fighter, p1Selected, p2Selected, cursorOn, onClick }) {
	const factionColor = FACTION_COLOR[fighter.factionAlignment];
	const isCustomized = (0, import_react.useMemo)(() => getCharacterMoveSet(fighter.id), [fighter.id])?.isCustomized ?? false;
	const face = getSelectMugOverride(fighter.id) ?? fighter.conceptArtUrl ?? fighter.gridPortrait ?? `/portraits/concept/${fighter.id}.png`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `relative flex flex-col items-center justify-center w-full aspect-square border transition-all duration-100 overflow-hidden group
        ${cursorOn ? "scale-110 z-10" : "scale-100"}
        ${p1Selected ? "border-blue-500" : p2Selected ? "border-red-500" : "border-zinc-700 hover:border-zinc-500"}
      `,
		style: {
			background: "#0a0a0c",
			boxShadow: cursorOn ? `0 0 0 2px #facc15, 0 0 12px #22d3ee, 0 0 18px ${factionColor}88` : p1Selected ? "0 0 8px #3b82f6aa" : p2Selected ? "0 0 8px #ef4444aa" : void 0,
			outline: cursorOn ? "1px solid #22d3ee" : void 0,
			outlineOffset: cursorOn ? 1 : void 0
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: face,
				alt: "",
				draggable: false,
				className: "absolute inset-0 z-0 w-full h-full object-cover object-top",
				style: { imageRendering: "auto" },
				onError: (e) => {
					const el = e.currentTarget;
					if (el.dataset.fallback === "1") return;
					el.dataset.fallback = "1";
					el.src = `/portraits/${fighter.id}.png`;
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-[1] opacity-[0.08] pointer-events-none",
				style: { backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.55) 1px, rgba(0,0,0,0.55) 2px)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-0 left-0 right-0 z-10 bg-black/70 py-0.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[7px] font-mono text-zinc-300 tracking-widest truncate w-full text-center px-1",
					children: fighter.name.toUpperCase()
				})
			}),
			p1Selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-0.5 left-0.5 z-20 text-[7px] font-mono font-black text-blue-300 bg-blue-900/80 px-1",
				children: "P1"
			}),
			p2Selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-0.5 right-0.5 z-20 text-[7px] font-mono font-black text-red-300 bg-red-900/80 px-1",
				children: "P2"
			}),
			isCustomized && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-4 right-0.5 z-20 w-1.5 h-1.5 rounded-full bg-green-400" })
		]
	});
}
function CharacterSelect({ onSelectP1, onSelectP2, onStartMatch }) {
	const allFighters = (0, import_react.useMemo)(() => getAllBannonFighters(), []);
	const characters = (0, import_react.useMemo)(() => getUniqueCharacters(allFighters), [allFighters]);
	const [p1Id, setP1Id] = (0, import_react.useState)(null);
	const [p2Id, setP2Id] = (0, import_react.useState)(null);
	const [p1Attire, setP1Attire] = (0, import_react.useState)("Default");
	const [p2Attire, setP2Attire] = (0, import_react.useState)("Default");
	const [p1PortraitUrl, setP1PortraitUrl] = (0, import_react.useState)(void 0);
	const [p2PortraitUrl, setP2PortraitUrl] = (0, import_react.useState)(void 0);
	const [activeSlot, setActiveSlot] = (0, import_react.useState)("p1");
	const [cursorIndex, setCursorIndex] = (0, import_react.useState)(0);
	const [countdown, setCountdown] = (0, import_react.useState)(60);
	const [customizerOpen, setCustomizerOpen] = (0, import_react.useState)(false);
	const [customizerCharId, setCustomizerCharId] = (0, import_react.useState)(null);
	const [, setMugTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const bump = () => setMugTick((n) => n + 1);
		window.addEventListener("bf-select-mugs", bump);
		window.addEventListener("storage", bump);
		return () => {
			window.removeEventListener("bf-select-mugs", bump);
			window.removeEventListener("storage", bump);
		};
	}, []);
	const p1Fighter = p1Id ? getBannonFighter(p1Id) : null;
	const p2Fighter = p2Id ? getBannonFighter(p2Id) : null;
	const cursorFighter = characters[cursorIndex] ?? null;
	(0, import_react.useEffect)(() => {
		if (countdown <= 0) {
			if (!p1Id && characters.length > 0) setP1Id(characters[0].id);
			if (!p2Id && characters.length > 1) setP2Id(characters[1].id);
			return;
		}
		const t = window.setTimeout(() => setCountdown((c) => c - 1), 1e3);
		return () => window.clearTimeout(t);
	}, [
		countdown,
		p1Id,
		p2Id,
		characters
	]);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		const cols = 9;
		if (e.key === "ArrowRight") setCursorIndex((i) => Math.min(characters.length - 1, i + 1));
		else if (e.key === "ArrowLeft") setCursorIndex((i) => Math.max(0, i - 1));
		else if (e.key === "ArrowDown") setCursorIndex((i) => Math.min(characters.length - 1, i + cols));
		else if (e.key === "ArrowUp") setCursorIndex((i) => Math.max(0, i - cols));
		else if (e.key === "Enter" || e.key === " ") {
			if (cursorFighter) handleFighterSelect(cursorFighter);
		}
	}, [
		cursorIndex,
		characters,
		cursorFighter
	]);
	(0, import_react.useEffect)(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
	const handleFighterSelect = (fighter) => {
		const attires = getCharacterAttires(fighter.id);
		const matched = attires.find((a) => a.model === fighter.model) ?? attires[0];
		const defaultAttire = matched?.attire ?? fighter.attire ?? "Default";
		const defaultPortrait = matched?.portraitUrl ?? fighter.portraitUrl;
		if (activeSlot === "p1") {
			setP1Id(fighter.id);
			setP1Attire(defaultAttire);
			setP1PortraitUrl(defaultPortrait);
			if (onSelectP1) onSelectP1(fighter);
			setActiveSlot("p2");
			if (!p2Id) {
				const cpu = characters.find((c) => c.id !== fighter.id) ?? characters[1] ?? characters[0];
				if (cpu) {
					const cpuAttires = getCharacterAttires(cpu.id);
					const cpuMatch = cpuAttires.find((a) => a.model === cpu.model) ?? cpuAttires[0];
					setP2Id(cpu.id);
					setP2Attire(cpuMatch?.attire ?? cpu.attire ?? "Default");
					setP2PortraitUrl(cpuMatch?.portraitUrl ?? cpu.portraitUrl);
					if (onSelectP2) onSelectP2(cpu);
				}
			}
		} else {
			setP2Id(fighter.id);
			setP2Attire(defaultAttire);
			setP2PortraitUrl(defaultPortrait);
			if (onSelectP2) onSelectP2(fighter);
		}
	};
	const handleStartMatch = () => {
		const f1 = p1Id ? getBannonFighter(p1Id) : null;
		const f2 = p2Id ? getBannonFighter(p2Id) : null;
		if (f1 && f2 && onStartMatch) {
			const a1 = getCharacterAttires(f1.id).find((a) => a.attire === p1Attire);
			const a2 = getCharacterAttires(f2.id).find((a) => a.attire === p2Attire);
			onStartMatch({
				...f1,
				attire: p1Attire,
				model: a1?.model ?? f1.model,
				portraitUrl: p1PortraitUrl || f1.portraitUrl
			}, {
				...f2,
				attire: p2Attire,
				model: a2?.model ?? f2.model,
				portraitUrl: p2PortraitUrl || f2.portraitUrl
			});
		}
	};
	const canStart = !!(p1Id && p2Id);
	const SLOTS_PER_ROW = 9;
	const rosterRows = [];
	for (let i = 0; i < characters.length; i += SLOTS_PER_ROW) rosterRows.push(characters.slice(i, i + SLOTS_PER_ROW));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 overflow-hidden select-none font-mono flex flex-col",
		style: { background: "linear-gradient(180deg, #0a0a0a 0%, #111113 40%, #0d0d0f 100%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 pointer-events-none opacity-[0.07]",
				style: { backgroundImage: `
          repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px)
        ` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 pointer-events-none opacity-20",
				style: {
					backgroundImage: "radial-gradient(circle, #555 1px, transparent 1px)",
					backgroundSize: "40px 40px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center pointer-events-none z-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[6vw] font-black tracking-[0.35em] text-white uppercase select-none",
					style: {
						opacity: .04,
						fontFamily: "monospace",
						filter: "blur(0.5px)"
					},
					children: "PLAYER SELECT"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-1 min-h-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col flex-1 border-r border-zinc-800/60 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterPortrait, {
								fighter: p1Fighter,
								attirePortraitUrl: p1PortraitUrl,
								slot: "P1",
								active: activeSlot === "p1"
							})
						}), p1Fighter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttireSelector, {
							characterId: p1Fighter.id,
							selectedAttire: p1Attire,
							onSelectAttire: (attire, url) => {
								setP1Attire(attire);
								setP1PortraitUrl(url);
							},
							slot: "P1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex flex-col items-center justify-center w-14 md:w-18 shrink-0 z-20",
						style: { background: "linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5",
								children: "PLAYER SELECT".split("").map((ch, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[6px] text-zinc-600 font-black tracking-widest leading-tight",
									children: ch
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-3xl md:text-4xl font-black tabular-nums",
									style: {
										color: countdown <= 10 ? "#ef4444" : "#facc15",
										textShadow: countdown <= 10 ? "0 0 16px #ef4444, 0 0 32px #ef444488" : "0 0 16px #facc15, 0 0 32px #facc1588",
										fontFamily: "monospace"
									},
									children: String(countdown).padStart(2, "0")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[7px] text-zinc-600 tracking-widest mt-0.5",
									children: "TIME"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 text-xs font-black text-zinc-700 tracking-widest",
								children: "VS"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col flex-1 border-l border-zinc-800/60 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterPortrait, {
								fighter: p2Fighter,
								attirePortraitUrl: p2PortraitUrl,
								slot: "P2",
								active: activeSlot === "p2"
							})
						}), p2Fighter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttireSelector, {
							characterId: p2Fighter.id,
							selectedAttire: p2Attire,
							onSelectAttire: (attire, url) => {
								setP2Attire(attire);
								setP2PortraitUrl(url);
							},
							slot: "P2"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-8 border-t border-b border-zinc-800 shrink-0",
				style: { background: "linear-gradient(90deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex items-center px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white font-black text-sm tracking-[0.2em] uppercase truncate",
							style: { textShadow: p1Fighter ? `0 0 8px ${FACTION_COLOR[p1Fighter.factionAlignment]}` : void 0 },
							children: p1Fighter?.name ?? "───"
						}), p1Fighter && p1Attire !== "Default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-[9px] text-zinc-500 tracking-widest truncate",
							children: p1Attire.toUpperCase()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-14 md:w-18 flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-full bg-zinc-700" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex items-center justify-end px-4",
						children: [p2Fighter && p2Attire !== "Default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 text-[9px] text-zinc-500 tracking-widest truncate",
							children: p2Attire.toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white font-black text-sm tracking-[0.2em] uppercase truncate text-right",
							style: { textShadow: p2Fighter ? `0 0 8px ${FACTION_COLOR[p2Fighter.factionAlignment]}` : void 0 },
							children: p2Fighter?.name ?? "───"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 shrink-0",
				style: { background: "linear-gradient(180deg, #0d0d0f 0%, #080808 100%)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 py-1 border-b border-zinc-800/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[8px] text-zinc-600 tracking-[0.3em]",
									children: "SELECTING FOR"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[9px] font-black tracking-[0.3em] px-2 py-0.5 border ${activeSlot === "p1" ? "border-blue-600 text-blue-400 bg-blue-950/40" : "border-red-600 text-red-400 bg-red-950/40"}`,
									children: activeSlot === "p1" ? "PLAYER 1" : "PLAYER 2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setActiveSlot(activeSlot === "p1" ? "p2" : "p1"),
									className: "text-[8px] text-zinc-600 hover:text-zinc-400 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 transition-colors",
									children: "SWITCH"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [cursorFighter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setCustomizerCharId(cursorFighter.id);
									setCustomizerOpen(true);
								},
								className: "text-[8px] text-zinc-500 hover:text-yellow-400 border border-zinc-800 hover:border-yellow-700 px-2 py-0.5 transition-colors",
								children: "CUSTOMIZE"
							}), canStart && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleStartMatch,
								className: "text-[10px] font-black text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-0.5 tracking-widest transition-colors",
								children: "FIGHT!"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-0.5 px-1 py-1",
						children: rosterRows.map((row, rowIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-0.5",
							style: { gridTemplateColumns: `repeat(11, 1fr)` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "aspect-square border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-700 text-[10px] font-mono hover:border-zinc-600 hover:text-zinc-400 transition-colors",
									onClick: () => {
										const pick = characters[Math.floor(Math.random() * characters.length)];
										if (pick) {
											setCursorIndex(characters.indexOf(pick));
											handleFighterSelect(pick);
										}
									},
									children: "?"
								}),
								row.map((fighter, i) => {
									const index = rowIdx * SLOTS_PER_ROW + i;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterSlot, {
										fighter,
										p1Selected: fighter.id === p1Id,
										p2Selected: fighter.id === p2Id,
										cursorOn: cursorIndex === index,
										onClick: () => {
											setCursorIndex(index);
											handleFighterSelect(fighter);
										}
									}, fighter.id);
								}),
								Array.from({ length: Math.max(0, SLOTS_PER_ROW - row.length) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square border border-zinc-900/30 bg-zinc-950/30" }, `empty-${rowIdx}-${i}`)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "aspect-square border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-700 text-[10px] font-mono hover:border-zinc-600 hover:text-zinc-400 transition-colors",
									onClick: () => {
										const pick = characters[Math.floor(Math.random() * characters.length)];
										if (pick) {
											setCursorIndex(characters.indexOf(pick));
											handleFighterSelect(pick);
										}
									},
									children: "?"
								})
							]
						}, `row-${rowIdx}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 py-1 border-t border-zinc-800/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[8px] text-zinc-700 tracking-[0.3em]",
							children: cursorFighter ? `${cursorFighter.name.toUpperCase()} · ${cursorFighter.fightingStyle.split(".")[0].toUpperCase()}` : "MOVE CURSOR TO SELECT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[8px] text-zinc-700 tracking-[0.3em]",
							children: [characters.length, " FIGHTERS · BANNON ROSTER"]
						})]
					})
				]
			}),
			customizerOpen && customizerCharId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveSetCustomizer, {
				initialCharacterId: customizerCharId,
				onClose: () => setCustomizerOpen(false),
				onConfirm: () => setCustomizerOpen(false)
			})
		]
	});
}
//#endregion
export { CharacterSelect as default };
