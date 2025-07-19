import express from 'express';
import * from '../controllers/user.controllers';
const user = express();

user.use(express.json());

user.use('/api/users', getAllUsers);


export default user;