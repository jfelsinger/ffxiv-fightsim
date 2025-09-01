export * from './effect';

export const effectsCollection = {
    'default': Effect,
    'aoe-square': AoeSquareEffect,
    'aoe-square-grid': AoeSquareGridEffect,
    'aoe-ring': AoeRingEffect,
    'aoe-disc': AoeDiscEffect,
    'aoe-group': AoeGroupEffect,
    'test-aoe': AoeDiscEffect,
    'tether': TetherEffect,
    'dice': DiceEffect,
    'distribute': DistributeEffect,
    'cast-bar': CastBarEffect,
    'cast': CastBarEffect,
    'stage-combo-cast-bar': StageComboCastEffect,

    'prey-marker': PreyMarkerEffect,
    'm2s-poison-sting': M2SPoisonStingEffect,
    'm2s-alarm-pheromones-2': M2SAlarmPheromones2Effect,
    'm2s-alarm-pheromones-2-bees': M2SAlarmPheromones2Effect,
    'kb-tower': KBTowerEffect,

    'm4s-near-far-indicator': M4SNearFarIndicatorEffect,
} as const;

export default effectsCollection;
