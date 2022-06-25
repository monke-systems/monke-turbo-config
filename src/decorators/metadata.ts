const turboConfigPropertiesSymbol = Symbol('turboConifgProperties');

export const addToPropertiesList = (target: object, propertyName: string) => {
  // get own fields from the target
  let complexFields = Reflect.getOwnMetadata(
    turboConfigPropertiesSymbol,
    target,
  );
  if (complexFields === undefined) {
    // merge with inherited fields, if available.
    complexFields = Reflect.hasMetadata(turboConfigPropertiesSymbol, target)
      ? Reflect.getMetadata(turboConfigPropertiesSymbol, target).slice(0)
      : [];

    // define own fields on the target
    Reflect.defineMetadata(turboConfigPropertiesSymbol, complexFields, target);
  }

  complexFields.push(propertyName);
};

export const getPropertiesList = (target: object): string[] => {
  return Reflect.getMetadata(turboConfigPropertiesSymbol, target) ?? [];
};
