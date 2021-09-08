import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

createConnection().then(db =>  {
    dotenv.config();
    const PORT = process.env.PORT || 3300;
    
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    
    app.listen(PORT, () => {
        console.log(`Running server in port ${PORT}`);
    });
})