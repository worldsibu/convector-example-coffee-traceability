import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class CoffeeToastBatch extends ConvectorModel<CoffeeToastBatch> {
  @ReadOnly()
  @Required()
  public readonly type = 'com.covalentx.coffee-toast-batch';

  @ReadOnly()
  @Required()
  @Validate(yup.array(yup.string()))
  // Grain batch portion references
  public composition: string[];

  @Required()
  @Validate(yup.number().min(0))
  public price: number;

  @ReadOnly()
  @Required()
  @Validate(yup.number().min(0))
  public weigth: number;

  @Required()
  @ReadOnly()
  @Validate(yup.string())
  // Participant reference
  public prducer: string;

  @ReadOnly()
  @Required()
  @Validate(yup.number().min(0))
  public created: number;

  @Required()
  @Validate(yup.string())
  // Participant reference
  public owner: string;
}
