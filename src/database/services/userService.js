// /src/database/services/userService.js

import User from '../models/user.js';
import bcrypt from "bcrypt";
import {generateToken} from "./jwtService.js";

const SALT_ROUNDS = 10;

export async function createOne({ login, password }) {
    const GENERIC_ERROR = 'Registration failed. Check your data and try again.';

    if (typeof login !== 'string' || login.trim().length === 0) {
        console.error('Login is required');
        throw new Error(GENERIC_ERROR);
    }

    if (typeof password !== 'string' || password.length < 5) {
        console.error('Password must be at least 5 characters long');
        throw new Error(GENERIC_ERROR);
    }

    const existing = await User.findOne({ login });
    if (existing) {
        const passwordMatch = await bcrypt.compare(password, existing.password);
        if (passwordMatch) {
            throw new Error('Account already exists. Try signing in.');
        } else {
            throw new Error(GENERIC_ERROR);
        }
    } else {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ login, password: hash });

        const token = generateToken({ userId: user._id });
        return { userId: user._id, token };
    }
}

export async function verifyUser(login, password) {
    const user = await User.findOne({ login });
    if (!user) {
        return null;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return null;
    }
    return { userId: user._id };
}

export async function loginUser({ login, password }) {
    if (typeof login !== 'string' || login.trim().length === 0) {
        return null;
    }

    if (typeof password !== 'string' || password.length < 5) {
        return null;
    }

    const user = await User.findOne({ login });
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    const token = generateToken({ userId: user._id });
    return { userId: user._id, token };
}