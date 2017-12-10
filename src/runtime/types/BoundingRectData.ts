export interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface BoundingRectData {
	self: Rect;
	descendants: Rect;
	hasDiff: boolean;
}
