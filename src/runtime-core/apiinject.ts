import { getcurrentInstance } from "./component";

export function provide(key: any, value: any) {
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
export function inject(key: any, defaultValue:any) {
  const instance = getcurrentInstance();
  if (instance) {
    const { parent } = instance;
    const parentProvides = parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    }else if(defaultValue){
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }else{
        console.warn('inject key not found');
    }
  }
}
