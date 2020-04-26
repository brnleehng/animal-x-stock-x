import { Router } from 'express';
import { listUsers, createUser, getUser, updateUser, deleteUser } from "../controllers/userController";

const userRoute = Router();

// User operations
userRoute.get('/api/v1/users', listUsers);

userRoute.post('/api/v1/users', createUser);

userRoute.get('/api/v1/users/:id', getUser);

userRoute.put('/api/v1/users/:id', updateUser);

userRoute.delete('/api/v1/items/:id', deleteUser);

// Order operations for the user
userRoute.post('/api/v1/users/:id/orders/:orderId', getUser);

userRoute.get('/api/v1/users/:id/orders/:orderId', getUser);

userRoute.put('/api/v1/users/:id/orders/:orderId', getUser);

userRoute.delete('/api/v1/users/:id/orders/:orderId', getUser);

export default userRoute;
