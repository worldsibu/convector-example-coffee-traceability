// tslint:disable:no-unused-expression
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import 'mocha';

import { CouchDBStorage } from '@worldsibu/convector-storage-couchdb';
import { FabricControllerAdapter } from '@worldsibu/convector-platform-fabric';
import { BaseStorage, ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';

import { ParticipantController, Participant } from 'participant-cc';
import {
  CoffeeController,
  CoffeeGrainPortionBatch,
  CoffeeToastBatch,
  CoffeeGrainBatch,
  CoffeeGrainQuality
} from '../src';

describe('Coffee', () => {
  const toasterId = uuid();
  const producerAId = uuid();
  const producerBId = uuid();
  let adapter: FabricControllerAdapter;
  let coffeeCtrl: ConvectorControllerClient<CoffeeController>;
  let participantCtrl: ConvectorControllerClient<ParticipantController>;

  before(async () => {
      adapter = new FabricControllerAdapter({
        skipInit: true,
        txTimeout: 300000,
        user: 'user1',
        channel: 'ch1',
        chaincode: 'coffee',
        keyStore: '$HOME/hyperledger-fabric-network/.hfc-org1',
        networkProfile: '$HOME/hyperledger-fabric-network/network-profiles/org1.network-profile.yaml',
        userMspPath: '$HOME/hyperledger-fabric-network/artifacts/crypto-config/peerOrganizations/org1.hurley.lab/users/User1@org1.hurley.lab/msp',
        userMsp: 'org1MSP'
      });
      coffeeCtrl = ClientFactory(CoffeeController, adapter);
      participantCtrl = ClientFactory(ParticipantController, adapter);
      await adapter.init(true);

      BaseStorage.current = new CouchDBStorage({
        host: 'localhost',
        protocol: 'http',
        port: '5084'
      }, 'ch1_coffee');

      await participantCtrl.$withUser('user1').register(new Participant({
        id: producerAId,
        name: 'ProducerA'
      }));

      await participantCtrl.$withUser('user2').register(new Participant({
        id: producerBId,
        name: 'ProducerB'
      }));

      await participantCtrl.$withUser('user3').register(new Participant({
        id: toasterId,
        name: 'Toaster'
      }));
  });

  after(() => {
    // Close the event listeners
    adapter.close();
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

    console.log('Creating grains batch');
    await coffeeCtrl.$withUser('user1').createGrainBatch(batch);
    console.log('Grains batch created');

    const savedBatch = new CoffeeGrainBatch(await coffeeCtrl.$query().getGrainBatch(batch.id));
    expect(savedBatch.id).to.exist;
  });

  it('should create a toast batch', async () => {
    const batch1 = new CoffeeGrainBatch({
      id: uuid(),
      location: 'San Jose',
      height: 70,
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
      height: 125,
      prducers: [producerBId],
      price: 92,
      weight: 150,
      quality: CoffeeGrainQuality.STANDARD,
      created: Date.now()
    });

    console.log('Creating grains batch', batch1.id);
    await coffeeCtrl.$withUser('user1').createGrainBatch(batch1);
    console.log('Creating grains batch', batch2.id);
    await coffeeCtrl.$withUser('user1').createGrainBatch(batch2);
    console.log('Creating grains batch', batch3.id);
    await coffeeCtrl.$withUser('user2').createGrainBatch(batch3);
    console.log('Grains batches created');

    const toastBatch = new CoffeeToastBatch({
      id: uuid(),
      prducer: toasterId,
      price: 300,
      created: Date.now()
    });

    console.log('Creating toast batch', toastBatch.id);
    await coffeeCtrl.$withUser('user3').createToastBatch(toastBatch, [
      new CoffeeGrainPortionBatch({ grainBatchId: batch1.id, weight: 50 }),
      new CoffeeGrainPortionBatch({ grainBatchId: batch2.id, weight: 80 }),
      new CoffeeGrainPortionBatch({ grainBatchId: batch3.id, weight: 20 })
    ]);
    console.log('Toast batch created');

    const justSavedBatch = await CoffeeToastBatch.getOne(toastBatch.id);
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
