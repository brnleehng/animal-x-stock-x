import { Router } from 'express';

const routes = Router();

routes.get('/api/v1/users', (req, res) => {
    return res.json([{
        id: "",
        createdTime: ""
    }]);
});

routes.post('/api/v1/users', (req, res) => {
    return res.json({
        id: "",
        errorCode: ""
    });
});

routes.get('/api/v1/users/:id', (req, res) => {
    return res.json({
        id: "",
        createdTime: ""
    });
});

routes.put('/api/v1/users/:id', (req, res) => {
    return res.json({
        id: "",
        errorCode: ""
    });
});

routes.delete('/api/v1/users/:id', (req, res) => {
    return res.json({
        id: "",
        errorCode: ""
    });
});

export default routes;
