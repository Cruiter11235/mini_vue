export function emit(instance: Instance, event: string, ...params: any[]) {
  const { props } = instance;
  const Camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_: any, c: string) => {
      return c ? c.toUpperCase() : "";
    });
  };
  const Capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  //   format function name
  const toHandleKey = (str: string): string => {
    return str ? "on" + Capitalize(str) : "";
  };
  const handledKey = toHandleKey(Camelize(event));
  const handler = props[handledKey];
  handler && handler(...params);
}
