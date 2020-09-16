export const getFormattedEventName = (name: string): string =>
  `@data-subscriber/${name}`;

export const getFormattedCustomEventName = (name: string): string =>
  `@custom-subscriber/${name}`;
