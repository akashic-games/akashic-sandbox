export type HandlerFunction<T> = (e: T) => void | boolean;

export interface CommonTriggerLike<T> {
	add(func: HandlerFunction<T>, owner?: any): void;
	remove(func: HandlerFunction<T>, owner?: any): void;
	removeAll(): void;
	fire(arg?: T): void;
}

export interface CommonTriggerConstructorLike {
	new <T>(): CommonTriggerLike<T>;
}

