import { Router } from 'express';
import { listTrades, createTrade, getTrade, updateTrade, deleteTrade } from "../controllers/tradeController";

const tradeRoute = Router();

tradeRoute.get('/api/v1/trades', listTrades);

tradeRoute.post('/api/v1/trades', createTrade);

tradeRoute.get('/api/v1/trades/:id', getTrade);

tradeRoute.put('/api/v1/trades/:id', updateTrade);

tradeRoute.delete('/api/v1/trades/:id', deleteTrade);

export default tradeRoute;
