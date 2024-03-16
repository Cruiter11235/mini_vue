'use strict';

const Fragment = Symbol("fragment");
const Text = Symbol("text");
function createVNode(type, props = {}, children = {}) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
        key: props && props.key,
    };
    if (typeof children === "string" || typeof children === "number") {
        vnode.shapeFlag = vnode.shapeFlag | 4;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8;
    }
    else if (vnode.shapeFlag & 2) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1
        : 2;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotsValue(value(props));
    }
}
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (typeof slot === "function") {
        return createVNode(Fragment, {}, slot(props));
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === "object";
}
function hasChanged(oldValue, newValue) {
    return !Object.is(oldValue, newValue);
}
class Stack {
    constructor() {
        this.items = [];
    }
    size() {
        return this.items.length;
    }
    empty() {
        return this.items.length === 0;
    }
    push_back(item) {
        this.items.push(item);
    }
    pop() {
        return this.items.pop();
    }
    top() {
        return this.items[this.items.length - 1];
    }
}
function getSequence(arr) {
    let stack = new Stack();
    let res = [];
    arr.forEach((i) => {
        while (!stack.empty() && stack.top() > i) {
            stack.pop();
        }
        stack.push_back(i);
        res = res.length < stack.size() ? stack.items : res;
    });
    return res;
}

const PublicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const PublicGetter = PublicPropertiesMap[key];
        if (PublicGetter) {
            return PublicGetter(instance);
        }
    },
};

function initProps(instance, props) {
    instance.props = props;
}

let activeEffect;
let shouldTrack;
function cleanupEffect(effect) {
    if (effect.active == false)
        return;
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.active = false;
}
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
        }
    }
}
const targetMap = new Map();
function track(target, key) {
    if (tracking() == false)
        return;
    let depMap = targetMap.get(target) || new Map();
    targetMap.set(target, depMap);
    const dep = depMap.get(key) || new Set();
    depMap.set(key, dep);
    trackEffect(dep);
}
function trackEffect(dep) {
    if (!dep.has(activeEffect))
        dep.add(activeEffect);
    if (activeEffect &&
        Object.prototype.hasOwnProperty.call(activeEffect, "deps") &&
        Array.isArray(activeEffect.deps)) {
        activeEffect.deps.push(dep);
    }
}
function trigger(target, key) {
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function tracking() {
    return shouldTrack == true && activeEffect != null;
}
function effect(fn, options = {}) {
    const scheduler = options === null || options === void 0 ? void 0 : options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    Object.defineProperty(runner, "effect", { value: _effect });
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return (target, key) => {
        if (!isReadonly) {
            if (key === "__isReactive")
                return true;
            if (key === "__isReadonly")
                return false;
            track(target, key);
        }
        else {
            if (key === "__isReactive")
                return false;
            if (key === "__isReadonly")
                return true;
        }
        const res = Reflect.get(target, key);
        if (isObject(res) && !shallow) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return (target, key, value) => {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const MutibleHandler = {
    get: get,
    set: set,
};
const ReadonlyHandler = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn("readonly object can't be modified");
        return true;
    },
};
const ShallowReadonlyHandler = extend({}, ReadonlyHandler, {
    get: shallowReadonlyGet,
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__isReactive";
    ReactiveFlags["IS_READONLY"] = "__isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function createActiveObject(raw, handler) {
    return new Proxy(raw, handler);
}
function reactive(raw) {
    return createActiveObject(raw, MutibleHandler);
}
function readonly(raw) {
    return createActiveObject(raw, ReadonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, ShallowReadonlyHandler);
}

function emit(instance, event, ...params) {
    const { props } = instance;
    const Camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : "";
        });
    };
    const Capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandleKey = (str) => {
        return str ? "on" + Capitalize(str) : "";
    };
    const handledKey = toHandleKey(Camelize(event));
    const handler = props[handledKey];
    handler && handler(...params);
}

class RefImpl {
    constructor(value) {
        this.__isRef = true;
        this.__rawValue = value;
        this.__value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this.__value;
    }
    set value(newValue) {
        if (!hasChanged(this.__rawValue, newValue))
            return;
        this.__value = convert(newValue);
        this.__rawValue = newValue;
        triggerEffects(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (tracking()) {
        trackEffect(ref.dep);
    }
}
function isRef(obj) {
    return !!obj.__isRef;
}
function ref(value) {
    return new RefImpl(value);
}
function unRef(obj) {
    return isRef(obj) ? obj.value : obj;
}
function ProxyRefs(obj) {
    return new Proxy(obj, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(Reflect.get(target, key)) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        parent: parent || {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
        isMounted: false,
        subTree: null,
        proxy: null,
        next: null,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setcurrentInstance(instance);
        const setupResult = setup(instance.props && shallowReadonly(instance.props), { emit: instance.emit });
        setcurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = ProxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getcurrentInstance() {
    return currentInstance;
}
function setcurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const instance = getcurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentsProvides = instance.parent.provides;
        if (provides === parentsProvides) {
            provides = instance.provides = Object.create(parentsProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getcurrentInstance();
    if (instance) {
        const { parent } = instance;
        const parentProvides = parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
        else {
            console.warn('inject key not found');
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function shouldUpdateComponent(prev, vnode) {
    const { props: prevProps } = prev;
    const { props: nextProps } = vnode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

let isFlushPending = false;
const queue = [];
const p = Promise.resolve();
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueFlush() {
    if (isFlushPending === true) {
        return;
    }
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    function patch(prev, vnode, container, parentComponent, anchor) {
        const { type, shapeFlag } = vnode;
        switch (type) {
            case Fragment:
                processFragment(prev, vnode, container, parentComponent);
                break;
            case Text:
                processText(prev, vnode, container);
                break;
            default:
                if (shapeFlag & 1) {
                    processElement(prev, vnode, container, parentComponent);
                }
                else if (shapeFlag & 2) {
                    processComponent(prev, vnode, container, parentComponent);
                }
                break;
        }
    }
    function processText(prev, vnode, container) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    function processFragment(prev, vnode, container, parentComponent, anchor) {
        mountChildren(vnode.children, container, parentComponent);
    }
    function processElement(prev, vnode, container, parentComponent, anchor) {
        if (prev !== null) {
            patchElement(prev, vnode, container, parentComponent);
        }
        else {
            mountElement(vnode, container, parentComponent);
        }
    }
    function patchElement(prev, vnode, container, parentComponent, anchor) {
        const oldProps = prev.props || {};
        const newProps = vnode.props || {};
        const el = (vnode.el = prev.el);
        patchChildren(prev, vnode, el, parentComponent);
        patchProps(el, oldProps, newProps);
    }
    const EMPTY_OBJ = {};
    function patchChildren(prev, vnode, el, parentComponent, anchor) {
        if (!prev)
            return;
        const { shapeFlag } = vnode;
        const prevShapeFlag = prev.shapeFlag;
        const c1 = prev.children;
        const c2 = vnode.children;
        if (shapeFlag & 4) {
            if (prevShapeFlag & 8) {
                unmountChildren(prev.children);
                hostSetElementText(el, c2);
            }
            else {
                if (c1 !== c2) {
                    hostSetElementText(el, c2);
                }
            }
        }
        else {
            if (prevShapeFlag & 4) {
                hostSetElementText(el, "");
                mountChildren(c2, el, parentComponent);
            }
            else {
                patchKeyedChildren(c1, c2, el, parentComponent);
            }
        }
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            ++i;
        }
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            let s1 = i;
            let s2 = i;
            const keyToNewIndexMap = new Map();
            const toBePatched = e2 - s2 + 1;
            const newIndexToOldIndexMap = new Array(toBePatched);
            newIndexToOldIndexMap.fill(0);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            let patched = 0;
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex < maxNewIndexSoFar) {
                        moved = true;
                    }
                    else {
                        maxNewIndexSoFar = newIndex;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        for (const key in newProps) {
            const pre = oldProps[key];
            const ne = newProps[key];
            if (pre !== ne) {
                hostPatchProp(el, key, pre, ne);
            }
        }
        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function processComponent(prev, vnode, container, parentComponent, anchor) {
        if (!prev) {
            mountComponent(vnode, container, parentComponent);
        }
        else {
            updateComponent(prev, vnode);
        }
    }
    function updateComponent(prev, vnode) {
        if (shouldUpdateComponent(prev, vnode)) {
            let instance = (vnode.component = prev.component);
            if (!instance)
                return;
            instance.next = vnode;
            instance.update();
        }
        else {
            vnode.el = prev.el;
            vnode.vnode = vnode;
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4) {
            el.textContent = children;
        }
        else if (shapeFlag & 8) {
            mountChildren(vnode.children, el, parentComponent);
        }
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((childVnode) => {
            patch(null, childVnode, container, parentComponent);
        });
    }
    function mountComponent(InitalVnode, container, parentComponent, anchor) {
        const instance = (InitalVnode.component = createComponentInstance(InitalVnode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, InitalVnode, container);
    }
    function setupRenderEffect(instance, InitialVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                InitialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentRender(instance, next);
                }
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const preSubTree = instance.subTree;
                patch(preSubTree, subTree, container, instance);
                InitialVnode.el = subTree.el;
            }
        }, {
            scheduler() {
                queueJobs(instance.update);
            },
        });
    }
    function updateComponentRender(instance, nextVnode) {
        instance.vnode = nextVnode;
        instance.props = nextVnode.props;
        instance.next = null;
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, preValue, nextValue) {
    const isOn = (str) => {
        return /^on[A-Z]/.test(str);
    };
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextValue);
    }
    else {
        if (nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, container, anchor) {
    if (anchor) {
        container.insertBefore(el, anchor);
    }
    else {
        container.append(el);
    }
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.ProxyRefs = ProxyRefs;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getcurrentInstance = getcurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
