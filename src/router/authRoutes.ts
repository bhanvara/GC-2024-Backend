import express from 'express';
import passport from 'passport';

const app = express();
const router = express.Router();

function isLoggedIn(req: any, res: any, next: any) {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

router.get('/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

router.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

router.get('/logout', (req, res) => {
    console.log(req.session.cookie);
    req.session.destroy((err: any) => {
        if (err) {
            console.error('Failed to destroy session:', err);
        }
    });
    res.send('Logged out');
});

router.get('/google/success', isLoggedIn, (req, res) => {
    let name = (req.user as { displayName: string }).displayName;
    res.send('Welcome ' + name);
    res.send('Successfully logged in');
});

router.get('/google/failure', (req, res) => {
    res.send('Failed to log in');
});

export default router;