export type EntityChangeType = "register" | "modified" | "unregister";

export interface EntityInfo {
	changeType: EntityChangeType;
	constructorName: string;
	local: boolean;
	id: number;
	x: number;
	y: number;
	width: number;
	heght: number;
	angle: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	touchable: boolean;
	raw: any;
}
