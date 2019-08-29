import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class CoffeeGrainPortionBatch extends ConvectorModel<CoffeeGrainPortionBatch> {
  public static async getByGrainBatchId(grainBatchId: string) {
    const portions = await CoffeeGrainPortionBatch.query(CoffeeGrainPortionBatch, {
      selector: { grainBatchId }
    }) as CoffeeGrainPortionBatch[];

    return portions;
  }

  @ReadOnly()
  @Required()
  public readonly type = 'com.covalentx.coffee-grain-batch-portion';

  @Required()
  @ReadOnly()
  @Validate(yup.string())
  // Grain batch reference
  public grainBatchId: string;

  @Required()
  @ReadOnly()
  @Validate(yup.string())
  // Toast batch reference
  public toastBatchId: string;

  @Required()
  @ReadOnly()
  @Validate(yup.number().min(0))
  public weight: number;
}
