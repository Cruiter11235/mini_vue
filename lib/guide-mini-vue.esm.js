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
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXTCHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAYCHILDREN */;
    }
    else if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFULCOMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    // console.log(vnode.shapeFlag);
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFULCOMPONENT */;
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

/*
import { effect } from './effect';
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-02-26 11:07:45
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-02-29 23:23:47
 * @FilePath: \my_mini_vue\src\reactivity\effect.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
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
        // trigger 刷新依赖
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
// create reactive proxy object
function reactive(raw) {
    return createActiveObject(raw, MutibleHandler);
}
//create readonly proxy object
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
    //   format function name
    const toHandleKey = (str) => {
        return str ? "on" + Capitalize(str) : "";
    };
    const handledKey = toHandleKey(Camelize(event));
    const handler = props[handledKey];
    handler && handler(...params);
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
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

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:49:42
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-04 10:25:06
 * @FilePath: \my_mini_vue\src\runtime-core\component.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
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
/**
 *
 * @param instance
 * @description: 初始化Instance,去给Instance下加一些东西
 */
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
/**
 * @description: 初始化组件的状态
 */
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    //   get setup
    const { setup } = Component;
    if (setup) {
        setcurrentInstance(instance);
        const setupResult = setup(instance.props && shallowReadonly(instance.props), { emit: instance.emit });
        setcurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
/**
 * @description 根据`setup`的返回值来初始化`Instance`的`setupState
 */
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
/**
 * @description: 挂载render函数到Instance上
 */
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

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:42:08
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-04 10:25:26
 * @FilePath: \my_mini_vue\src\runtime-core\renderer.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
function render(vnode, container) {
    // patch
    patch(vnode, container, null);
}
/**
 * @param vnode
 * @param container
 * @description 挂载
 */
function patch(vnode, container, parentComponent) {
    // console.log(parentComponent);
    // 去处理组件
    // TODO 判断vnode是不是element
    // processElement();
    // console.log(vnode.type);
    // console.log(vnode.shapeFlag);
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFULCOMPONENT */) {
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
// 挂载dom元素
function mountElement(InitialVnode, container, parentComponent) {
    // string array
    const el = (InitialVnode.el = document.createElement(InitialVnode.type));
    const { children, shapeFlag } = InitialVnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXTCHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAYCHILDREN */) {
        // 渲染vnode下所有的子节点
        mountChildren(InitialVnode, el, parentComponent);
    }
    const { props } = InitialVnode;
    // check format
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
/**
 * @description 挂载vnode下所有的子节点
 */
function mountChildren(vnode, container, parentComponent) {
    var _a;
    (_a = vnode.children) === null || _a === void 0 ? void 0 : _a.forEach((childVnode) => {
        patch(childVnode, container, parentComponent);
    });
}
/**
 * @description 挂载组件
 */
function mountComponent(InitalVnode, container, parentComponent) {
    const instance = createComponentInstance(InitalVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, InitalVnode, container);
}
function setupRenderEffect(instance, InitialVnode, container) {
    const { proxy } = instance;
    // 执行instance.render 但是此时里面的this已经指向proxy
    const subTree = instance.render.call(proxy);
    //   vnode -> patch
    //   vnode -> element
    patch(subTree, container, instance);
    InitialVnode.el = subTree.el;
}

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:32:52
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 17:10:54
 * @FilePath: \my_mini_vue\src\runtime-core\createApp.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 创建虚拟节点
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
        //init
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

export { createApp, createTextVNode, getcurrentInstance, h, inject, provide, renderSlots };
