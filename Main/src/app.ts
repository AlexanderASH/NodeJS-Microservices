import express, { Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import * as amqp from 'amqplib/callback_api';
import { Product } from './entity/product';

createConnection().then(db =>  {
    dotenv.config();
    const PORT = process.env.PORT || 3300;
    const amqpURL = process.env.AMQP_URL!;

    const productRepository = db.getMongoRepository(Product);

    amqp.connect(amqpURL, (error0, connection) => {
        if (error0) {
            throw error0;
        }

        connection.createChannel((error1, channel) => {
            if (error1) {
                throw error1;
            }

            channel.assertQueue('product_created', { durable: false });
            channel.assertQueue('product_updated', { durable: false });
            channel.assertQueue('product_deleted', { durable: false });
            
            const app = express();
            
            app.use(cors());
            app.use(express.json());

            channel.consume('product_created', async (message) => {
                const eventProduct: Product = JSON.parse(message.content.toString());
                const product = new Product();

                product.admin_id = Number.parseInt(eventProduct.id);
                product.title = eventProduct.title;
                product.image = eventProduct.image;
                product.likes = eventProduct.likes;

                await productRepository.save(product);
            }, {
                noAck: true
            });

            channel.consume('product_updated', async (message) => {
                const eventProduct: Product = JSON.parse(message.content.toString());
                const product = await productRepository.findOne({admin_id: parseInt(eventProduct.id)});

                productRepository.merge(product, {
                    title: eventProduct.title,
                    image: eventProduct.image,
                    likes: eventProduct.likes
                });

                await productRepository.save(product);
            }, {
                noAck: true
            });

            channel.consume('product_deleted', async (message) => {
                const admin_id = parseInt(message.content.toString());

                await productRepository.deleteOne({admin_id});
            })
        
            app.listen(PORT, () => {
                console.log(`Running server in port ${PORT}`);
            });

            process.on('beforeExit', () => {
                console.log('closing');
                connection.close();
            });
        });
    });

})