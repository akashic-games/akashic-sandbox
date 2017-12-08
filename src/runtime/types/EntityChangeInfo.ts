export type EntityChangeType = "register" | "modified" | "unregister";

export interface EntityRegisterInfo {
	infoType: "register";
	id: number;
	raw: any;
	constructorName: string;
	local: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	touchable: boolean;
	childIds: number[];
}

export interface EntityModifiedInfo {
	infoType: "modified";
	id: number;
	raw: any;
	constructorName: string;
	local: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	touchable: boolean;
	childIds: number[];
}

export interface EntityUnregisterInfo {
	infoType: "unregister";
	id: number;
}

export type EntityChangeInfo = EntityRegisterInfo | EntityModifiedInfo | EntityUnregisterInfo;
