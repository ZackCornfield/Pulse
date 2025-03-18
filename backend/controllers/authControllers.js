require('dotenv').config();
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userQueries = require('../queries/usersQueries');

module.exports = {
    signUpPost: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });    
        }   

        const {email, username, password} = req.body;

        const newUser = await userQueries.addUser(email, username, password);

        res.status(201).json({
            message: "User created successfully", 
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }  
        })
    },
    logInPost: async (req, res) => {
        const {username, password} = req.body;  

        const user = await userQueries.existUser("username", username);
        if (!user) {
            return res.status(400).json({ message: "User not found" }); 
        }

        console.log(password);
        console.log(user.password); 
        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(400).json({ message: "Incorrect password" });
        }   

        // Create JWT token
        jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'}, (err, token) => {
            res.status(200).json({ token });
        })
    },
    demoLogInPost: async (req, res) => {
        const demoUsername = "demo";
        const user = await userQueries.existUser("username", demoUsername); 
        if (!user) {
            console.log("User not found");  
            return res.status(400).json({ message: "User not found" }); 
        }

        // Create JWT token
        jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'}, (err, token) => {
            res.status(200).json({ token });
        })
    }
};