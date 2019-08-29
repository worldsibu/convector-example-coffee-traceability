import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';
import { Participant } from 'participant-cc';

export enum CoffeeGrainQuality {
  PREMIUM = 'premium',
  STANDARD = 'standard'
}

export class CoffeeGrainBatch extends ConvectorModel<CoffeeGrainBatch> {
  public static async getOneFull(id: string) {
    const batch = await CoffeeGrainBatch.getOne(id);
    const prducers = await Promise.all(batch.prducers.map(async id => Participant.getOne(id)));

    return {
      batch: batch.toJSON() as CoffeeGrainBatch,
      prducers: prducers.map(p => p.toJSON() as Participant)
    };
  }

  @ReadOnly()
  @Required()
  public readonly type = 'com.covalentx.coffee-grain-batch';

  @Required()
  @ReadOnly()
  @Validate(yup.string())
  public location: string;

  @Required()
  @ReadOnly()
  @Validate(yup.number().min(0))
  public height: number;

  @Required()
  @ReadOnly()
  @Validate(yup.string().oneOf(Object.keys(CoffeeGrainQuality).map(k => CoffeeGrainQuality[k])))
  public quality: CoffeeGrainQuality;

  @Required()
  @ReadOnly()
  @Validate(yup.number().min(0))
  public weight: number;

  @Required()
  @Validate(yup.number().min(0))
  public price: number;

  @Required()
  @ReadOnly()
  @Validate(yup.array(yup.string()))
  // Participant reference
  public prducers: string[];

  @ReadOnly()
  @Required()
  @Validate(yup.number().min(0))
  public created: number;

  @Required()
  @Validate(yup.string())
  // Participant reference
  public owner: string;
}
