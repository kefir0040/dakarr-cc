module.exports = ({ Config }) => {
  const disable_crashers = false;
  const shape_level_luck_factor = 0.99; 
  const shape_rarity_luck_factor = 1;

  Config.ENEMY_CAP_NEST = 0;

  /**
   * Applies luck based on type ('level' or 'rarity')
   * - For 'level', favors lower levels with lower luck factors
   * - For 'rarity', normal random distribution based on the luck factor
   */
  const applyLuck = (base, luck, type) => {
    const randomChance = Math.random() * luck;
    
    if (type === 'level') {
      if (luck >= 1) {
        return Math.min(base + Math.floor(randomChance * 2), 3);
      } else {
        return Math.min(base + Math.floor(randomChance * 1.5), 2);
      }
    } else if (type === 'rarity') {
      return Math.min(base + Math.floor(randomChance), 5);
    }
    
    return base;
  };

  const generateShapeClass = (shape_type, shape_level, shape_rarity, type) => {
    if (shape_level > 1 && type === 'crasher') {
      console.log(`Tried to generate shape_${shape_level}_${shape_type}_${shape_rarity}_${type} but level was too high to be crasher!`)
      return `shape_${shape_level}_${shape_type}_${shape_rarity}_base`;
    };
    return `shape_${shape_level}_${shape_type}_${shape_rarity}_${type}`;
  };

  Config.FOOD_TYPES = Array(3).fill().map((_, shape_type, a) => [
    4 ** (a.length - shape_type),
    Array(4).fill().map((_, shape_level, b) => [
      5 ** (b.length - shape_level),
      Array(6).fill().map((_, shape_rarity, c) => {
        shape_level = applyLuck(shape_level, shape_level_luck_factor, 'level');
        shape_rarity = applyLuck(shape_rarity, shape_rarity_luck_factor, 'rarity');
        return [
          shape_rarity ? 10 ** (c.length - shape_rarity - 1) : 200_000_000,
          disable_crashers ? 
            generateShapeClass(shape_type, shape_level, shape_rarity, 'base') :
            [[24, generateShapeClass(shape_type, shape_level, shape_rarity, 'base')], 
             [1, generateShapeClass(shape_type, shape_level, shape_rarity, 'crasher')]].filter(Boolean)
        ];
      })
    ])
  ]);

  Config.FOOD_TYPES_NEST = Array(2).fill().map((_, shape_type, a) => [
    4 ** (a.length - shape_type),
    Array(4).fill().map((_, shape_level, b) => [
      5 ** (b.length - shape_level),
      Array(6).fill().map((_, shape_rarity, c) => {
        shape_level = applyLuck(shape_level, shape_level_luck_factor, 'level');
        shape_rarity = applyLuck(shape_rarity, shape_rarity_luck_factor, 'rarity');
        return [
          shape_rarity ? 10 ** (c.length - shape_rarity - 1) : 200_000_000,
          disable_crashers ? 
            generateShapeClass(shape_type + 3, shape_level, shape_rarity, 'base') :
            [[24, generateShapeClass(shape_type + 3, shape_level, shape_rarity, 'base')], 
             [1, generateShapeClass(shape_type + 3, shape_level, shape_rarity, 'crasher')]].filter(Boolean)
        ];
      })
    ])
  ]);

  console.log('[food.js] using new shape class format with type-based luck\n[food.js] shape level luck factor:', shape_level_luck_factor, '\n[food.js] shape rarity luck factor', shape_rarity_luck_factor);
};