import express, { Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import * as amqp from 'amqplib/callback_api';

createConnection().then(db =>  {
    dotenv.config();
    const PORT = process.env.PORT || 3300;
    const amqpURL = process.env.AMQP_URL!;

    amqp.connect(amqpURL, (error0, connection) => {
        if (error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }
            
            const app = express();
            
            app.use(cors());
            app.use(express.json());
        
            app.listen(PORT, () => {
                console.log(`Running server in port ${PORT}`);
            });
        });
    });

})