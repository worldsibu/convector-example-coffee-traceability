import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Participant extends ConvectorModel<Participant> {
  public static async getFromFingerpring(fingerprint: string) {
    const participants = await Participant.query(Participant, {
      selector: {
        type: new Participant().type,
        identity: fingerprint
      }
    }) as Participant[];

    if (!participants.length) {
      throw new Error(`No participant was found with fingerprint: ${fingerprint}`);
    }

    return participants[0];
  }

  @ReadOnly()
  @Required()
  public readonly type = 'com.covalentx.participant';

  @Required()
  @Validate(yup.string())
  public name: string;

  @Required()
  @Validate(yup.string())
  public identity: string;
}
