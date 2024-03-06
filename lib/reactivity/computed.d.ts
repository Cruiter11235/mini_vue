declare class computedRefImpl {
    private __dirty;
    private __value;
    private __effect;
    constructor(getter: any);
    get value(): any;
}
export declare function computed(getter: any): computedRefImpl;
export {};
