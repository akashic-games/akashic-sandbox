import { Rect, BoundingRectData } from "../types/BoundingRectData";

/*
akashic-engine 関連のユーティリティ群をまとめたファイル。
このファイル内の interface 定義は、特定バージョンの akashic-engine に依存せずに
ユーティリティを定義するための、最低限のプロパティのみを持つものである。
実装は常に akashic-engine が提供する。他のファイルでの使用を想定してはいない点に注意。
*/

export interface Point {
	x: number;
	y: number;
}

export interface MatrixLike {
	multiplyNew(mat: MatrixLike): MatrixLike;
	multiplyPoint(p: Point): Point;
}

export interface SceneLike {
	game: any;
	children: EntityLike[];
	getMatrix?: () => MatrixLike;  // 存在しないが、 g.E#parent の型判別の方法がないのでやむなくoptionalで定義
}

export interface EntityLike {
	scene: SceneLike;
	width: number;
	height: number;
	parent?: EntityLike | SceneLike;
	children?: EntityLike[];
	getMatrix: () => MatrixLike;
}

export interface CameraLike {
	getMatrix(): MatrixLike;
}

function calculatesAncestorMatrix(e: EntityLike, focusingCamera?: CameraLike): MatrixLike {
	if (e.parent && e.parent.getMatrix) {
		var m1 = e.parent.getMatrix();
		var m2 = calculatesAncestorMatrix(e.parent as EntityLike, focusingCamera);
		return m2 ? m1.multiplyNew(m2) : m1;
	} else {
		return focusingCamera ? focusingCamera.getMatrix() : undefined;
	}
}

export function calculateEntityBoundingRect(entity: EntityLike, anscestorMatrix?: MatrixLike): BoundingRectData {
	let matrix = entity.getMatrix();
	if (!anscestorMatrix)
		anscestorMatrix = calculatesAncestorMatrix(entity, entity.scene.game.focusingCamera);
	if (anscestorMatrix)
		matrix = anscestorMatrix.multiplyNew(matrix);

	const coords = [
		{ x: 0, y: 0 },
		{ x: 0, y: entity.height },
		{ x: entity.width, y: 0 },
		{ x: entity.width, y: entity.height }
	];
	let p = matrix.multiplyPoint(coords[0]);
	let left = p.x, right = p.x, top = p.y, bottom = p.y;

	for (let i = 1; i < coords.length; ++i) {
		p = matrix.multiplyPoint(coords[i]);
		if (left > p.x)
			left = p.x;
		if (right < p.x)
			right = p.x;
		if (top > p.y)
			top = p.y;
		if (bottom < p.y)
			bottom = p.y;
	};
	const r = { left, right, top, bottom };

	if (entity.children !== undefined) {
		for (let i = 0; i < entity.children.length; ++i) {
			var childRect = calculateEntityBoundingRect(entity.children[i], matrix).descendants;
			if (!childRect)
				continue;
			if (left > childRect.left)
				left = childRect.left;
			if (right < childRect.right)
				right = childRect.right;
			if (top > childRect.top)
				top = childRect.top;
			if (bottom < childRect.bottom)
				bottom = childRect.bottom;
		}
	}

	return {
		self: r,
		descendants: { left, right, top, bottom },
		hasDiff: (r.left !== left || r.right !== right || r.top !== top || r.bottom !== bottom)
	};
}
