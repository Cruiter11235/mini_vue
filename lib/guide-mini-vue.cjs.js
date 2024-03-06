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
    };
    if (typeof children === "string") {
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

const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === "object";
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

const PublicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
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

const targetMap = new Map();
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

function createComponentInstance(vnode, parent) {
    console.log(parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        parent: parent || {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
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
        instance.setupState = setupResult;
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

function render(vnode, container) {
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.appendChild(textNode);
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountElement(InitialVnode, container, parentComponent) {
    const el = (InitialVnode.el = document.createElement(InitialVnode.type));
    const { children, shapeFlag } = InitialVnode;
    if (shapeFlag & 4) {
        el.textContent = children;
    }
    else if (shapeFlag & 8) {
        mountChildren(InitialVnode, el, parentComponent);
    }
    const { props } = InitialVnode;
    const isOn = (key) => {
        return /^on[A-Z]/.test(key);
    };
    for (const key in props) {
        const val = props[key];
        if (isOn(key)) {
            el.addEventListener(key.slice(2).toLowerCase(), val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
function mountChildren(vnode, container, parentComponent) {
    var _a;
    (_a = vnode.children) === null || _a === void 0 ? void 0 : _a.forEach((childVnode) => {
        patch(childVnode, container, parentComponent);
    });
}
function mountComponent(InitalVnode, container, parentComponent) {
    const instance = createComponentInstance(InitalVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, InitalVnode, container);
}
function setupRenderEffect(instance, InitialVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    InitialVnode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
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

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getcurrentInstance = getcurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
