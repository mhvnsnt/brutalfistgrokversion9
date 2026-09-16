//#region node_modules/.nitro/vite/services/ssr/assets/pixelate-BHnHyi5M.js
function pixelateDataUrl(src, cells = 64) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const small = document.createElement("canvas");
			small.width = cells;
			small.height = cells;
			const sctx = small.getContext("2d");
			if (!sctx) {
				reject(/* @__PURE__ */ new Error("no 2d"));
				return;
			}
			sctx.imageSmoothingEnabled = false;
			sctx.drawImage(img, 0, 0, cells, cells);
			const out = document.createElement("canvas");
			out.width = 256;
			out.height = 256;
			const octx = out.getContext("2d");
			if (!octx) {
				reject(/* @__PURE__ */ new Error("no 2d"));
				return;
			}
			octx.imageSmoothingEnabled = false;
			octx.drawImage(small, 0, 0, 256, 256);
			resolve(out.toDataURL("image/png"));
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("image load failed"));
		img.src = src;
	});
}
/** Shrink a photo to a ControlNet-sized JPEG so the booth request stays under the payload cap. */
function downscaleDataUrl(src, maxEdge = 768, quality = .82) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));
			const c = document.createElement("canvas");
			c.width = w;
			c.height = h;
			const ctx = c.getContext("2d");
			if (!ctx) {
				reject(/* @__PURE__ */ new Error("no 2d"));
				return;
			}
			ctx.drawImage(img, 0, 0, w, h);
			resolve(c.toDataURL("image/jpeg", quality));
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("image load failed"));
		img.src = src;
	});
}
var KEY = "bf-booth-gallery-v1";
var MUG_KEY = "bf-select-mugs-v1";
function loadBoothGallery() {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? "[]");
	} catch {
		return [];
	}
}
function saveBoothShot(shot) {
	const next = [shot, ...loadBoothGallery()].slice(0, 24);
	localStorage.setItem(KEY, JSON.stringify(next));
	return next;
}
function getSelectMugOverride(fighterId) {
	try {
		return JSON.parse(localStorage.getItem(MUG_KEY) ?? "{}")[fighterId] ?? null;
	} catch {
		return null;
	}
}
function setSelectMugOverride(fighterId, concept) {
	const map = (() => {
		try {
			return JSON.parse(localStorage.getItem(MUG_KEY) ?? "{}");
		} catch {
			return {};
		}
	})();
	map[fighterId] = concept;
	localStorage.setItem(MUG_KEY, JSON.stringify(map));
	window.dispatchEvent(new Event("bf-select-mugs"));
}
//#endregion
export { saveBoothShot as a, pixelateDataUrl as i, getSelectMugOverride as n, setSelectMugOverride as o, loadBoothGallery as r, downscaleDataUrl as t };
