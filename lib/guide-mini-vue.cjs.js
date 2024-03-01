'use strict';

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:36:22
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 21:42:39
 * @FilePath: \my_mini_vue\src\runtime-core\vnode.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
function createVNode(type, props, children) {
    const vnode = { type, props, children, el: null };
    return vnode;
}

function isObject(val) {
    return val !== null && typeof val === 'object';
}

const PublicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const PublicGetter = PublicPropertiesMap[key];
        if (PublicGetter) {
            return PublicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
/**
 *
 * @param instance
 * @description: 初始化Instance,去给Instance下加一些东西
 */
function setupComponent(instance) {
    // initProps(instance)
    // initSlots(instance)
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
        const setupResult = setup();
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

/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-01 14:42:08
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-01 22:01:02
 * @FilePath: \my_mini_vue\src\runtime-core\renderer.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */
function render(vnode, container) {
    // patch
    patch(vnode, container);
}
/**
 * @param vnode
 * @param container
 * @description 挂载
 */
function patch(vnode, container) {
    // 去处理组件
    // TODO 判断vnode是不是element
    // processElement();
    console.log(vnode.type);
    if (typeof vnode.type == "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 挂载dom元素
function mountElement(vnode, container) {
    // string array
    const el = vnode.el = document.createElement(vnode.type);
    const { children } = vnode;
    if (typeof children == "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 渲染vnode下所有的子节点
        mountChildren(vnode, el);
    }
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
/**
 * @description 挂载vnode下所有的子节点
 */
function mountChildren(vnode, container) {
    var _a;
    (_a = vnode.children) === null || _a === void 0 ? void 0 : _a.forEach((childVnode) => {
        patch(childVnode, container);
    });
}
/**
 * @description 挂载组件
 */
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    // 执行instance.render 但是此时里面的this已经指向proxy
    const subTree = instance.render.call(proxy);
    //   vnode -> patch
    //   vnode -> element
    patch(subTree, container);
    vnode.el = subTree.el;
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

exports.createApp = createApp;
exports.h = h;
