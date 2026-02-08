import { SetMetadata } from '@nestjs/common';

/**
 * Dekorator oznaczający że endpoint wymaga aktywnej subskrypcji
 * Użycie: @RequiresSubscription() nad metodą controllera
 */
export const RequiresSubscription = (required: boolean = true) =>
  SetMetadata('requiresSubscription', required);
