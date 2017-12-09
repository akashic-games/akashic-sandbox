import { EntityChangeInfo } from "../types/EntityChangeInfo";
import { SceneChangeInfo } from "../types/SceneChangeInfo";

export interface ContentChangeInfo {
	scene: SceneChangeInfo;
	entity: EntityChangeInfo[];
}
