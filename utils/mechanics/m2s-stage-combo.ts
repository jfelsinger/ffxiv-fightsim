import {
    type Scheduled,
} from '../scheduled';
import { Effect } from '../effects';

export const DefaultMechanicSchedulingMode = 'parallel';

import {
    Mechanic,
    type MechanicOptions,
} from './';

export type M2SStageComboOptions = MechanicOptions & {
};

type StageComboName =
    | 'outerstage'
    | 'centerstage';

type StageComboEffectName =
    | 'centerstage-cast'
    | 'outerstage-cast'
    | 'center-intercards'
    | 'cross-cards'
    | 'outer-cards';

const stageCombos: Record<StageComboName, [StageComboEffectName, StageComboEffectName, StageComboEffectName, StageComboEffectName]> = {
    outerstage: [
        'outerstage-cast',
        'center-intercards',
        'cross-cards',
        'outer-cards',
    ],
    centerstage: [
        'centerstage-cast',
        'outer-cards',
        'cross-cards',
        'center-intercards',
    ],
} as const;

export class M2SStageCombo extends Mechanic {
    name = 'm2s-stage-combo';
    options: M2SStageComboOptions;

    constructor(options: M2SStageComboOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';
    }

    getEffects(): Scheduled<Effect>[] {
        const allEffects = this.effects;

        const stageEffects: Record<StageComboEffectName, Scheduled<Effect> | undefined> = {
            // 'centerstage-cast': allEffects.find(e => e.label?.toLowerCase() === 'centerstage-cast'),
            // 'outerstage-cast': allEffects.find(e => e.label?.toLowerCase() === 'outerstage-cast'),
            'center-intercards': allEffects.find(e => e.label?.toLowerCase() === 'center-intercards'),
            'cross-cards': allEffects.find(e => e.label?.toLowerCase() === 'cross-cards'),
            'outer-cards': allEffects.find(e => e.label?.toLowerCase() === 'outer-cards'),
        };

        const comboName: StageComboName = (Math.random() < 0.5) ? 'centerstage' : 'outerstage';
        const castName = comboName === 'centerstage' ? 'Centerstage Combo' : 'Outerstage Combo';
        const result = stageCombos[comboName].map(e => stageEffects[e]).filter(e => typeof e !== 'undefined');
        this.options.castName = castName;
        result[0].startDelay = 650;

        return result;
        // return [
        //     ...stageCombos[comboName].map(e => stageEffects[e]).filter(e => typeof e !== 'undefined'),
        // ];
    }
}
