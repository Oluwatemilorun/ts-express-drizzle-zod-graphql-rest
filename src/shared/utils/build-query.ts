/**
 * Converts a list of dot string relations into a nested object relations
 *
 * @example
 * Input: [
 *   'session',
 *   'session.id',
 *   'session.token',
 *   'billing',
 *   'billing.id',
 *   'billing.google',
 *   'billing.google.id',
 * ]
 * Output: {
 *   with: {
 *     session: {
 *       with: {
 *         id: true,
 *         token: true,
 *       }
 *     },
 *     billing: {
 *       id: true,
 *       with: {
 *         google: {
 *           with: {
 *             id: true,
 *             token: true
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * @param relations
 */
export function buildRelations(relations: string[]) {
  const output: Record<string, any> = { with: {} };

  for (const relation of relations) {
    if (relation.indexOf('.') > -1) {
      const nestedRelations = relation.split('.');

      let parent = output;

      while (nestedRelations.length > 1) {
        const nestedRelation = nestedRelations.shift() as string;
        parent = parent.with[nestedRelation] =
          parent.with[nestedRelation] !== true &&
          typeof parent.with[nestedRelation] === 'object'
            ? parent.with[nestedRelation]
            : { with: {} };
      }

      parent.with[nestedRelations[0]] = true;

      continue;
    }

    output.with[relation] = output.with[relation] ?? true;
  }

  return output;
}

/**
 * Converts a list of dot string into a nested object
 * @example
 * input: [
 *    order,
 *    order.items,
 *    order.swaps,
 *    order.swaps.additional_items,
 *    order.discounts,
 *    order.discounts.rule,
 *    order.claims,
 *    order.claims.additional_items,
 *    additional_items,
 *    additional_items.variant,
 *    return_order,
 *    return_order.items,
 *    return_order.shipping_method,
 *    return_order.shipping_method.tax_lines
 * ]
 * output: {
 *   "order": {
 *     "items": true,
 *     "swaps": {
 *       "additional_items": true
 *     },
 *     "discounts": {
 *       "rule": true
 *     },
 *     "claims": {
 *       "additional_items": true
 *     }
 *   },
 *   "additional_items": {
 *     "variant": true
 *   },
 *   "return_order": {
 *     "items": true,
 *     "shipping_method": {
 *       "tax_lines": true
 *     }
 *   }
 * }
 * @param collection
 */
export function buildSelect(collection: string[]) {
  const output: Record<string, any> = {};

  for (const relation of collection) {
    if (relation.indexOf('.') > -1) {
      const nestedRelations = relation.split('.');

      let parent = output;

      while (nestedRelations.length > 1) {
        const nestedRelation = nestedRelations.shift() as string;
        parent = parent[nestedRelation] =
          parent[nestedRelation] !== true && typeof parent[nestedRelation] === 'object'
            ? parent[nestedRelation]
            : {};
      }

      parent[nestedRelations[0]] = true;

      continue;
    }

    output[relation] = output[relation] ?? true;
  }

  return output;
}
