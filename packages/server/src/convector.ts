import { join, resolve } from "path";
import { keyStore, identityName, channel, chaincode, networkProfile, identityId } from './env';
import * as fs from 'fs';
import * as ws from 'ws';
import { ChannelEventHub } from 'fabric-client';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { ClientFactory } from '@worldsibu/convector-core';
import { CoffeeController } from 'coffee-cc';
import { ParticipantController } from 'participant-cc';

const adapter = new FabricControllerAdapter({
    txTimeout: 300000,
    user: identityName,
    channel,
    chaincode,
    keyStore: resolve(__dirname, keyStore),
    networkProfile: resolve(__dirname, networkProfile)
    // userMspPath: keyStore
});

export const initAdapter = adapter.init();

let hub: ChannelEventHub;

export const initHub = (async () => {
  await initAdapter;
  const userPeer = adapter.channel.getPeers()
    .find(p => p.getMspid() === adapter.user.getIdentity().getMSPId());

  hub = adapter.channel.newChannelEventHub(userPeer.getPeer());
  hub.connect(true);
})();

export const listenTo = (ws: ws, eventName = '.*') => {
  const handler = (event, blockNumber, txId, txStatus) => ws.send({
    event,
    blockNumber,
    txId,
    txStatus,
  });

  ws.on('close', () => hub.unregisterChaincodeEvent(handler));
  hub.registerChaincodeEvent(chaincode, eventName, handler,
    (err) => console.log('Error on event listener', err),
    { filtered: false } as any,
  );
}

export const CoffeeControllerBackEnd =
    ClientFactory(CoffeeController, adapter);

export const ParticipantControllerBackEnd =
    ClientFactory(ParticipantController, adapter);


const contextPath = join(keyStore + '/' + identityName);
fs.readFile(contextPath, 'utf8', async function (err, data) {
    if (err) {
        throw new Error('Context in ' + contextPath
        + ' does not exist. Make sure that path resolves to your key stores folder');
    } else {
        console.log('Context path with cryptographic materials exists');
    }
});

