import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';

import { Participant } from './participant.model';

@Controller('participant')
export class ParticipantController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async register(
    @Param(Participant)
    participant: Participant
  ) {
    const existing = await Participant.getOne(participant.id);
    if (existing.id) {
      throw new Error(`Participant with id ${participant.id} has been already registered`);
    }

    participant.identity = this.sender;
    await participant.save();
    this.tx.stub.setEvent('UserRegister', { participant });
  }

  @Invokable()
  public async get(
    @Param(yup.string())
    id: string
  ) {
    const existing = await Participant.getOne(id);
    if (!existing.id) {
      throw new Error(`No producer was found with id ${id}`);
    }

    return existing.toJSON() as Participant;
  }

  @Invokable()
  public async getAll() {
    return (await Participant.getAll()).map(p => p.toJSON() as Participant);
  }
}
