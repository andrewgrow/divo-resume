// /src/controllers/usersController.js

import {createOne as createUser, loginUser as loginProcess} from "../database/services/userService.js"

export async function createOne(req, res) {
    const login = req.body.login;
    const password = req.body.password;

    try {
        const user = await createUser({login, password})
        res.status(201).json(user)
    }  catch (error) {
        console.log(error)
        res.status(400).json({error: error.message})
    }
}

export async function loginUser(req, res) {
    const login = req.body.login;
    const password = req.body.password;

    const user = await loginProcess({login, password})
    if (!user) {
        res.status(400).json({error: 'Login Failed'})
    } else {
        res.status(200).json(user)
    }
}