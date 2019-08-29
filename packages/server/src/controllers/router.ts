import * as express from 'express';
import { 
    ParticipantController_register_post,
    ParticipantController_get_get,
    ParticipantController_getAll_get,
    CoffeeController_createGrainBatch_post,
    CoffeeController_getGrainBatch_get,
    CoffeeController_getAllGrainBatches_get,
    CoffeeController_sellGrainBatch_post,
    CoffeeController_createToastBatch_post,
    CoffeeController_getToastBatch_get,
    CoffeeController_getAllToastBatches_get } from './controllers'
export default express.Router()
.post('/participant/register', ParticipantController_register_post)
.get('/participant/get/:id', ParticipantController_get_get)
.get('/participant/getAll', ParticipantController_getAll_get)
.post('/coffee/createGrainBatch', CoffeeController_createGrainBatch_post)
.get('/coffee/getGrainBatch/:batchId', CoffeeController_getGrainBatch_get)
.get('/coffee/getAllGrainBatches', CoffeeController_getAllGrainBatches_get)
.post('/coffee/sellGrainBatch', CoffeeController_sellGrainBatch_post)
.post('/coffee/createToastBatch', CoffeeController_createToastBatch_post)
.get('/coffee/getToastBatch/:batchId', CoffeeController_getToastBatch_get)
.get('/coffee/getAllToastBatches', CoffeeController_getAllToastBatches_get)
