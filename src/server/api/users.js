const express = require('express')
const usersRouter = express.Router();

const {
    createUser,
    getUser,
    getUserByEmail,
    getAllUsers,
    getUserById
} = require('../db/users');

const jwt = require('jsonwebtoken')



usersRouter.get('/', async( req, res, next) => {
    console.log('getting users...')
    try {
        const users = await getAllUsers();

        res.send({
            users
        });
    } catch ({name, message}) {
        next({name, message})
    }
});

usersRouter.get('/:userId', async(req, res, next) => {

    console.log('getting user by id');
    try {
        
        const userId = req.params.userId;
        const id = parseInt (userId, 10);
        // const id = parseInt(userID, 10);
        const user = await getUserById(id);


        res.send({
            message: 'User:',
            id: user.id,
            isAdmin: user.isAdmin
        })
    } catch (err) {
        console.log('error getting user by id', err)
    }

});

usersRouter.post('/login', async(req, res, next) => {
    console.log('logging in')
    const { email, password } = req.body;
    if(!email || !password) {
        next({
            name: 'MissingCredentialsError',
            message: 'Please supply both an email and password'
        });
    }
    try {
        const user = await getUser({email, password});
        if(user) {
            const token = jwt.sign({
                id: user.id,
                email
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });

            res.send({
                message: 'Login successful!',
                token,
                id: user.id,
                isAdmin: user.isAdmin
                
            });
        }
        else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch(err) {
        console.error(err);
        next(err);
    }
});

usersRouter.post('/register', async(req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const _user = await getUserByEmail(email);

        if(_user) {
            next({
                name: 'UserExistsError',
                message: 'A user with that email already exists'
            });
        }

        const user = await createUser({
            name,
            email,
            password
        });

        const token = jwt.sign({
            id: user.id,
            email
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: 'Sign up successful!',
            token
        });
    } catch({name, message}) {
        next({name, message})
    }
})

module.exports = usersRouter;