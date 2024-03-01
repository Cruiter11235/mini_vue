export declare const MutibleHandler: {
    get: (target: any, key: any) => any;
    set: (target: any, key: any, value: any) => boolean;
};
export declare const ReadonlyHandler: {
    get: (target: any, key: any) => any;
    set: (target: any, key: any, value: any) => boolean;
};
export declare const ShallowReadonlyHandler: {
    get: (target: any, key: any) => any;
    set: (target: any, key: any, value: any) => boolean;
} & {
    get: (target: any, key: any) => any;
};
