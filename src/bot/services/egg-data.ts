export const EGG_ITEMS: Record<string, { name: string; emoji: string; forcedRarity?: string }> = {
    egg_normal:  { name: 'Trứng Phàm Cốt',    emoji: '🪨', forcedRarity: 'Normal' },
    egg_magic:   { name: 'Trứng Linh Quang',   emoji: '🔮', forcedRarity: 'Magic' },
    egg_rare:    { name: 'Trứng Huyền Tinh',   emoji: '🌌', forcedRarity: 'Rare' },
    egg_unique:  { name: 'Trứng Thiên Mệnh',   emoji: '💠', forcedRarity: 'Unique' },
    egg_legend:  { name: 'Trứng Hồng Hoang',   emoji: '🌟', forcedRarity: 'Legend' },
    egg_random:  { name: 'Trứng Thiên Cơ',     emoji: '🥚' },
};

export function rollEggDrop(): string | null {
    const roll = Math.random();
    if (roll < 0.0003) return 'egg_legend';
    if (roll < 0.001)  return 'egg_unique';
    if (roll < 0.005)  return 'egg_rare';
    if (roll < 0.02)   return 'egg_magic';
    if (roll < 0.06)   return 'egg_normal';
    if (roll < 0.065)  return 'egg_random';
    return null;
}
