// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Participant, ParticipantController } from 'participant-cc';
import { CoffeeGrainBatch, CoffeeController, CoffeeGrainQuality, CoffeeToastBatch, CoffeeGrainPortionBatch } from '../src';

describe('Coffee', () => {
  const toasterId = uuid();
  const producerAId = uuid();
  const producerBId = uuid();
  let adapter: MockControllerAdapter;
  let coffeeCtrl: ConvectorControllerClient<CoffeeController>;
  let participantCtrl: ConvectorControllerClient<ParticipantController>;

  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    coffeeCtrl = ClientFactory(CoffeeController, adapter);
    participantCtrl = ClientFactory(ParticipantController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'CoffeeController',
        name: join(__dirname, '..')
      }, {
        version: '*',
        controller: 'ParticipantController',
        name: join(__dirname, '../../participant-cc')
      }
    ]);

    adapter.addUser('ProducerA');
    adapter.addUser('ProducerB');
    adapter.addUser('Toaster');

    await participantCtrl.$withUser('ProducerA').register(new Participant({
      id: producerAId,
      name: 'ProducerA'
    }));

    await participantCtrl.$withUser('ProducerB').register(new Participant({
      id: producerBId,
      name: 'ProducerB'
    }));

    await participantCtrl.$withUser('Toaster').register(new Participant({
      id: toasterId,
      name: 'Toaster'
    }));
  });

  it('should create a grains batch', async () => {
    const batch = new CoffeeGrainBatch({
      id: uuid(),
      location: 'San Jose',
      height: 100,
      prducers: [producerAId, producerBId],
      price: 100,
      weight: 100,
      quality: CoffeeGrainQuality.PREMIUM,
      created: Date.now()
    });

    await coffeeCtrl.$withUser('ProducerA').createGrainBatch(batch);

    const savedBatch = new CoffeeGrainBatch(await coffeeCtrl.$query().getGrainBatch(batch.id));
    expect(savedBatch.id).to.exist;
  });

  it('should create a toast batch', async () => {
    const batch1 = new CoffeeGrainBatch({
      id: uuid(),
      location: 'San Jose',
      height: 100,
      prducers: [producerAId, producerBId],
      price: 100,
      weight: 50,
      quality: CoffeeGrainQuality.PREMIUM,
      created: Date.now()
    });
    const batch2 = new CoffeeGrainBatch({
      id: uuid(),
      location: 'San Jose',
      height: 100,
      prducers: [producerAId],
      price: 115,
      weight: 100,
      quality: CoffeeGrainQuality.PREMIUM,
      created: Date.now()
    });
    const batch3 = new CoffeeGrainBatch({
      id: uuid(),
      location: 'San Jose',
      height: 100,
      prducers: [producerBId],
      price: 92,
      weight: 150,
      quality: CoffeeGrainQuality.STANDARD,
      created: Date.now()
    });

    await coffeeCtrl.$withUser('ProducerA').createGrainBatch(batch1);
    await coffeeCtrl.$withUser('ProducerA').createGrainBatch(batch2);
    await coffeeCtrl.$withUser('ProducerB').createGrainBatch(batch3);

    const toastBatch = new CoffeeToastBatch({
      id: uuid(),
      prducer: toasterId,
      price: 300,
      created: Date.now()
    });

    await coffeeCtrl.$withUser('Toaster').createToastBatch(toastBatch, [
      new CoffeeGrainPortionBatch({ grainBatchId: batch1.id, weight: 50 }),
      new CoffeeGrainPortionBatch({ grainBatchId: batch2.id, weight: 80 }),
      new CoffeeGrainPortionBatch({ grainBatchId: batch3.id, weight: 20 })
    ]);

    const justSavedBatch = await adapter.getById<CoffeeToastBatch>(toastBatch.id);
    expect(justSavedBatch.owner).to.eq(toasterId);

    const fullModel = await coffeeCtrl.$query().getToastBatch(toastBatch.id);
    expect(Object.keys(fullModel.composition).length).to.eq(3);

    console.log('Batch', fullModel.batch.id, 'composed of:');
    Object.keys(fullModel.composition).map(id => {
      const portion = fullModel.composition[id];
      return `  ${
        Math.round(portion.participation * 100)
      }% from batch ${
        portion.batch.id
      } (${
        portion.batch.location
      } ${
        portion.batch.height
      } m a.s.l.) of ${
        portion.prducers.map(p => p.name).join(', ')
      }`
    }).map(log => console.log(log));
  });
});
