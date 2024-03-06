declare class RefImpl {
    private __value;
    dep: Set<any>;
    private __rawValue;
    __isRef: boolean;
    constructor(value: any);
    get value(): any;
    set value(newValue: any);
}
export declare function isRef(obj: any): boolean;
export declare function ref(value: any): RefImpl;
export declare function unRef(obj: any): any;
export declare function ProxyRefs(obj: any): any;
export {};
