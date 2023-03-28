export const createSignal = <T extends any>(initValue: T) => {
  let value = initValue;

  const depCollection: Set<any> = new Set();

  const getter = function(this: any) {
    const dep = this;
    console.log("add dep", this);
    depCollection.add(dep);

    return value;
  };
  const setter = (next: T) => {
    depCollection.forEach((v) => {
      console.log('effect dep:', v);
    });
    value = next;
  };
  return [getter, setter] as [() => T, (value: T) => void];
};
