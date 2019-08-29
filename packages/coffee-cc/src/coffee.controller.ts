import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
  FlatConvectorModel
} from '@worldsibu/convector-core';

import { Participant } from 'participant-cc';

import { CoffeeGrainBatch } from './grain-batch.model';
import { CoffeeToastBatch } from './toast-batch.model';
import { CoffeeGrainPortionBatch } from './grain-batch-portion.model';

@Controller('coffee')
export class CoffeeController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async createGrainBatch(
    @Param(CoffeeGrainBatch)
    batch: CoffeeGrainBatch
  ) {
    const existing = await CoffeeGrainBatch.getOne(batch.id);
    if (existing.id) {
      throw new Error(`Batch with id ${batch.id} has been already registered`);
    }

    const creator = await Participant.getFromFingerpring(this.sender);
    batch.owner = creator.id;

    await batch.save();
  }

  @Invokable()
  public async getGrainBatch(
    @Param(yup.string())
    batchId: string
  ) {
    const batch = await CoffeeGrainBatch.getOne(batchId);
    if (!batch.id) {
      throw new Error(`No batch found with id ${batch.id}`);
    }

    return batch.toJSON() as CoffeeGrainBatch;
  }

  @Invokable()
  public async getAllGrainBatches() {
    return (await CoffeeGrainBatch.getAll()).map(p => p.toJSON() as CoffeeGrainBatch);
  }

  @Invokable()
  public async sellGrainBatch(
    @Param(yup.string())
    batchId: string,
    @Param(yup.string())
    to: string
  ) {
    const batch = await CoffeeGrainBatch.getOne(batchId);
    if (!batch.id) {
      throw new Error(`No batch found with id ${batch.id}`);
    }

    const sender = await Participant.getFromFingerpring(this.sender);
    if (batch.owner !== sender.id) {
      throw new Error(`Only the participant ${sender.id} can sell the batch ${batchId}`);
    }

    batch.owner = to;
    await batch.save();
  }

  @Invokable()
  public async createToastBatch(
    @Param(CoffeeToastBatch)
    batch: CoffeeToastBatch,
    @Param(yup.array(CoffeeGrainPortionBatch.schema()))
    composition: FlatConvectorModel<CoffeeGrainPortionBatch>[]
  ) {
    const existing = await CoffeeToastBatch.getOne(batch.id);
    if (existing.id) {
      throw new Error(`Batch with id ${batch.id} has been already registered`);
    }

    let weigth = 0;
    batch.composition = [];

    await Promise.all(composition.map(async portion => {
      const grainBatch = await CoffeeGrainBatch.getOne(portion.grainBatchId);
      const consumedPortions = await CoffeeGrainPortionBatch.getByGrainBatchId(portion.grainBatchId);
      const remainingPortion = grainBatch.weight - consumedPortions.reduce((total, p) => total + p.weight, 0);

      if (portion.weight > remainingPortion) {
        throw new Error(`Portion from batch ${portion.grainBatchId} exceeds the limits`);
      }

      const postionModel = new CoffeeGrainPortionBatch({
        ...portion,
        id: `${portion.grainBatchId}_${batch.id}`,
        toastBatchId: batch.id
      });

      batch.composition.push(postionModel.id);
      weigth += portion.weight;
      await postionModel.save();
    }));

    const creator = await Participant.getFromFingerpring(this.sender);
    batch.weigth = weigth;
    batch.prducer = creator.id;
    batch.owner = creator.id;

    await batch.save();
  }

  @Invokable()
  public async getToastBatch(
    @Param(yup.string())
    batchId: string
  ) {
    const batch = await CoffeeToastBatch.getOne(batchId);
    if (!batch.id) {
      throw new Error(`No batch found with id ${batchId}`);
    }

    const composition: {
      [k: string]: {
        batch: CoffeeGrainBatch;
        prducers: Participant[];
        participation: number;
      }
    } = await batch.composition.reduce(async (result, portionId) => {
      const obj = await result;
      const portion = await CoffeeGrainPortionBatch.getOne(portionId);
      const grainBatch = await CoffeeGrainBatch.getOneFull(portion.grainBatchId);
      const participation = portion.weight / batch.weigth;

      return {...obj, [portionId]: {...grainBatch, participation}};
    }, Promise.resolve({}));

    return {
      batch: batch.toJSON() as CoffeeToastBatch,
      composition
    };
  }

  @Invokable()
  public async getAllToastBatches() {
    return (await CoffeeToastBatch.getAll()).map(p => p.toJSON() as CoffeeToastBatch);
  }
}
