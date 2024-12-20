export class CustomEvent<T> {
    readonly type: string;

    // This is a hack to make the type system happy,
    // just ignore it
    readonly $detail: T;

    constructor(type: string) {
        this.type = type;
        this.$detail = undefined as unknown as T;
    }
};
