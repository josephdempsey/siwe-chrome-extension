import cors from 'cors';
import express from 'express';
import Session from 'express-session';
import fetch from 'node-fetch';
import { generateNonce, ErrorTypes, SiweMessage } from 'siwe';

const app = express();
app.use(express.json());
var whitelist = ['chrome-extension://<Insert Chrome Extension ID>', 'http://localhost:3000']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors({
    origin: corsOptions.origin,
    credentials: true,
}))

app.use(Session({
    name: 'siwe-quickstart',
    secret: "siwe-quickstart-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/nonce', async function (req, res) {
    req.session.nonce = generateNonce();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(req.session.nonce);
});

app.post('/verify', async function (req, res) {
    try {
        console.log("verify called");
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }

        let message = new SiweMessage(req.body.message);
        const fields = await message.validate(req.body.signature);
        console.log("fields", fields.nonce);
        console.log("req.session", req.session.nonce);
        if (fields.nonce !== req.session.nonce) {
            console.log(req.session);
            res.status(422).json({
                message: `Invalid nonce.`,
            });
            return;
        }
        req.session.siwe = fields;
        req.session.cookie.expires = new Date(fields.expirationTime);
        req.session.save(() => res.status(200).end());
    } catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
        console.error(e);
        switch (e) {
            case ErrorTypes.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).json({ message: e.message }));
                break;
            }
            case ErrorTypes.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).json({ message: e.message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).json({ message: e.message }));
                break;
            }
        }
    }
});

app.get('/personal_information', async function (req, res) {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${req.session.siwe.address}`)
});

console.log("Started app on port 3001")
app.listen(3001);