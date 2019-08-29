import { Request, Response } from 'express';
import { CoffeeControllerBackEnd } from '../convector';
import { ParticipantControllerBackEnd } from '../convector';


export async function ParticipantController_register_post(req: Request, res: Response): Promise<void>{
    try{
        let params = req.body;
            res.status(200).send(await ParticipantControllerBackEnd
                .register(params.participant));
            
    } catch(ex) {
        console.log('Error post ParticipantController_register', ex.stack);
        res.status(500).send(ex);
    }
}
export async function ParticipantController_get_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await ParticipantControllerBackEnd
            .get(params.id));
        
    } catch(ex) {
        console.log('Error get ParticipantController_get', ex.stack);
        res.status(500).send(ex);
    }
}
export async function ParticipantController_getAll_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await ParticipantControllerBackEnd
            .getAll());
        
    } catch(ex) {
        console.log('Error get ParticipantController_getAll', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_createGrainBatch_post(req: Request, res: Response): Promise<void>{
    try{
        let params = req.body;
            res.status(200).send(await CoffeeControllerBackEnd
                .createGrainBatch(params.batch));
            
    } catch(ex) {
        console.log('Error post CoffeeController_createGrainBatch', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_getGrainBatch_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await CoffeeControllerBackEnd
            .getGrainBatch(params.batchId));
        
    } catch(ex) {
        console.log('Error get CoffeeController_getGrainBatch', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_getAllGrainBatches_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await CoffeeControllerBackEnd
            .getAllGrainBatches());
        
    } catch(ex) {
        console.log('Error get CoffeeController_getAllGrainBatches', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_sellGrainBatch_post(req: Request, res: Response): Promise<void>{
    try{
        let params = req.body;
            res.status(200).send(await CoffeeControllerBackEnd
                .sellGrainBatch(params.batchId,params.to));
            
    } catch(ex) {
        console.log('Error post CoffeeController_sellGrainBatch', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_createToastBatch_post(req: Request, res: Response): Promise<void>{
    try{
        let params = req.body;
            res.status(200).send(await CoffeeControllerBackEnd
                .createToastBatch(params.batch,params.composition));
            
    } catch(ex) {
        console.log('Error post CoffeeController_createToastBatch', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_getToastBatch_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await CoffeeControllerBackEnd
            .getToastBatch(params.batchId));
        
    } catch(ex) {
        console.log('Error get CoffeeController_getToastBatch', ex.stack);
        res.status(500).send(ex);
    }
}
export async function CoffeeController_getAllToastBatches_get(req: Request, res: Response): Promise<void>{
    try{
        let params = req.params;
        res.status(200).send(await CoffeeControllerBackEnd
            .getAllToastBatches());
        
    } catch(ex) {
        console.log('Error get CoffeeController_getAllToastBatches', ex.stack);
        res.status(500).send(ex);
    }
}