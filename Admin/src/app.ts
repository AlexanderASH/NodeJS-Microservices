import express, { Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { Product } from './entity/product';

createConnection().then(db =>  {
    dotenv.config();
    const PORT = process.env.PORT || 3300;
    
    const productRepository = db.getRepository(Product); 

    const app = express();
    
    app.use(cors());
    app.use(express.json());

    app.get('/api/products', async (req: Request, res: Response) => {
        const products = await productRepository.find();

        return res.json(products);
    });
    
    app.post('/api/products', async (req: Request, res: Response) => {
        const product = productRepository.create(req.body);
        const result = await productRepository.save(product);

        return res.send(result);
    });

    app.get('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id);
        
        return res.send(product);
    });
    
    app.put('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id);
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product);

        return res.send(result);
    });

    app.delete('/api/products/:id', async (req: Request, res: Response) => {
        const result = await productRepository.delete(req.params.id);

        return res.send(result);
    });

    app.post('/api/products/:id/like', async (req: Request, res: Response) => {
        const product = await productRepository.findOne(req.params.id);
        product.likes++;
        const result = await productRepository.save(product);

        return res.send(result);
    });

    app.listen(PORT, () => {
        console.log(`Running server in port ${PORT}`);
    });
})