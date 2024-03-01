export declare class ReactiveEffect {
    private _fn;
    scheduler: Function | undefined;
    deps: any[];
    active: boolean;
    constructor(fn: any, scheduler?: any);
    run(): any;
    stop(): void;
}
export declare function track(target: any, key: any): void;
export declare function trackEffect(dep: any): void;
export declare function trigger(target: any, key: any): void;
export declare function triggerEffects(dep: any): void;
export declare function tracking(): boolean;
export declare function effect(fn: any, options?: any): () => any;
export declare function stop(runner: {
    (): any;
    effect?: any;
}): void;
