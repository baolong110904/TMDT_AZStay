import express from 'express';
import { getAllUsers } from '../controllers/user.controllers';
const user = express();

user.use(express.json());
user.use('/api/users', getAllUsers);

user.get("/", (req, res) => {
    res.send("Test");
});

export default user;