/**
 * Commands kept in the source tree but hidden from the public Discord command list.
 * Remove a command from this set to re-enable it after a deploy.
 */
export const DISABLED_COMMANDS = new Set<string>([
  'pet',
  'daily',
  'claim_all',
  'claim_rank',
  'inventory',
  'shop',
  'buy',
  'sell',
  'use',
  'train',
  'power_up',
  'journey',
  'farm',
  'grind',
  'expedition',
  'tower',
  'pk',
  'rank',
  'status',
  'couple',
  'nasa',
  'ctw',
  'bienthai',
]);

export function isCommandDisabled(commandName: string): boolean {
  return DISABLED_COMMANDS.has(commandName);
}
