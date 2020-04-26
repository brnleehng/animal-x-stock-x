import { Router } from 'express';
import { listAsks, listBids, listItems, createItem, getItem, updateItem, deleteItem, placeBid, placeAsk } from "../controllers/itemController";

const itemRoute = Router();

itemRoute.get('/api/v1/items', listItems);

itemRoute.post('/api/v1/items', createItem);

itemRoute.get('/api/v1/items/:id', getItem);

itemRoute.put('/api/v1/items/:id', updateItem);

itemRoute.delete('/api/v1/items/:id', deleteItem);


itemRoute.get('/api/v1/items/:id/sales', deleteItem);

itemRoute.delete('/api/v1/items/:id/sales', deleteItem);


itemRoute.get('/api/v1/items/:id/bids', listBids);

itemRoute.post('/api/v1/items/:id/bids', placeBid);


itemRoute.post('/api/v1/items/:id/asks', listAsks);

itemRoute.post('/api/v1/items/:id/asks', placeAsk);

export default itemRoute;
