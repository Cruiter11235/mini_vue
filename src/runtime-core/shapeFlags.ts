/*
 * @Author: Jinjun Zhuang Cruiter11235@outlook.com
 * @Date: 2024-03-03 12:57:55
 * @LastEditors: Jinjun Zhuang Cruiter11235@outlook.com
 * @LastEditTime: 2024-03-03 13:00:05
 * @FilePath: \my_mini_vue\src\runtime-core\shapeFlags.ts
 * @Description:
 *
 * Copyright (c) 2024 by cruiter11235@outlook.com, All Rights Reserved.
 */

export const enum ShapeFlags {
  ELEMENT = 1,
  STATEFULCOMPONENT = 1 << 1,
  TEXTCHILDREN = 1 << 2,
  ARRAYCHILDREN = 1 << 3,
  SLOT_CHILDREN = 1 << 4,
}
