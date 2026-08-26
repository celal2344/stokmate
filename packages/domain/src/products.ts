export const productUnit = {
  piece: 1,
  kilogram: 2,
  litre: 3,
  package: 4
} as const;

export const productStatus = {
  active: 1,
  inactive: 2,
  discontinued: 3
} as const;

export type ProductUnit = (typeof productUnit)[keyof typeof productUnit];
export type ProductStatus = (typeof productStatus)[keyof typeof productStatus];

export function isProductStatus(value: number): value is ProductStatus {
  return Object.values(productStatus).includes(value as ProductStatus);
}

export function isProductUnit(value: number): value is ProductUnit {
  return Object.values(productUnit).includes(value as ProductUnit);
}
