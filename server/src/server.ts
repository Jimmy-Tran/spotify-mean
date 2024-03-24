import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";
import * as querystring from "querystring";
// import { connectToDatabase } from "./database";
import mongoose from "mongoose";
import User from "./models/user";


// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();

const { ATLAS_URI } = process.env;
const { CLIENT_ID} = process.env;
const { REDIRECT_URI } = process.env;
const { CLIENT_SECRET } = process.env;
let accessToken: string;

const app = express();
mongoose.connect(ATLAS_URI);

function generateRandomString(number: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < number; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;

}

app.listen(5200, () => {
           console.log(`Server running at http://localhost:5200...`);
       });

app.get('/login', function (req, res) {
    let state = generateRandomString(16);
    let scopes = 'ugc-image-upload user-library-read user-read-playback-state ' +
        'user-read-currently-playing playlist-read-private playlist-read-collaborative ' +
        'playlist-modify-private playlist-modify-public user-follow-modify user-follow-read user-read-playback-position' +
        ' user-top-read user-read-recently-played user-library-modify user-library-read';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            client_id: CLIENT_ID,
            response_type: 'code',
            scope: scopes,
            redirect_uri: REDIRECT_URI,
            state: state
        }));
    }

);

app.get('/callback', async (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;

    if (state === null) {
        res.redirect('/' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        const axios = require('axios');

        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            form: {
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Content-Type':'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
            },
            params: {
                grant_type: 'client_credentials'
            }
        };

        try {
            // Exchange authorization code for access token
            const tokenResponse = await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers });
            accessToken = tokenResponse.data.access_token;
            const profile = await getProfile(accessToken);
            const userId = profile.id;

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                { $set: { userId, accessToken } },
                { upsert: true, new: true } // Include "new: true" option
            );

            if (updatedUser) {
                console.log("User updated:", updatedUser);
            } else {
                console.log("No user found or updated.");
            }
            res.redirect("http://localhost:4200/");

        } catch (error) {
            console.error("Error while fetching access token:", error);
            res.redirect('/' + querystring.stringify({
                error: 'Failed to get access token'
            }));
        }
    }
});

 async function getProfile(accessToken: string) {
    const axios = require('axios');
    const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = response.data;
    const userId = data.id;
    return {userId, ...data};

}

app.get('/me' , async (req, res) => {
    const profile = await getProfile(accessToken);
    res.json(profile);
});


if (!ATLAS_URI) {
    console.error("No ATLAS_URI environment variable has been defined in config.env");
    process.exit(1);
}

// connectToDatabase(ATLAS_URI)
//     .then(() => {
//         const app = express();
//         app.use(cors());
//
//         // start the Express server
//         app.listen(5200, () => {
//             console.log(`Server running at http://localhost:5200...`);
//         });
//
//     })
//     .catch(error => console.error(error));