import EventEmitter from "events";

export class TypedEventEmitter<T extends Record<string, any>> extends EventEmitter {
    emit<K extends keyof T & string>(event: K, data: T[K]): boolean {
        return super.emit(event, data);
    }

    on<K extends keyof T & string>(event: K, listener: (data: T[K]) => void): this {
        return super.on(event, listener);
    }
}
