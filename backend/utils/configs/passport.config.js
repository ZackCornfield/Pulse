const { Strategy, ExtractJwt } = require('passport-jwt');  
const GoogleStrategy = require('passport-google-oauth20').Strategy;    
const jwtSecret = process.env.JWT_SECRET;   
const userQueries = require("../../queries/usersQueries");

module.exports = (passport) => {
    passport.use(new Strategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),   
        secretOrKey: jwtSecret
    }, async (jwtPayload, done) => {
        try {
            // Find user by ID from JWT payload
            const user = await userQueries.existUser("id", jwtPayload.id);
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            } 
        } catch (error) {
            return done(error, false);
        }
    }));

    // Google OAuth strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user based on Google profile
            let user = await userQueries.findOrCreateUserByGoogleProfile(profile);
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));
};