const secret = require('../secret');
const jwt = require('jsonwebtoken');

function Auth(req, res, next) {
    const authToken = req.headers.authorization

    try {
        if (!authToken) {
            res.status(401);
            res.json({ err: 'Necessária autenticão.' });
            return
        }
    
        const [ type, token ] = authToken.split(' ');
    
        const decoded = jwt.verify(token, secret);
        
        // autorização somente para cargos 0 ou 1
        if (decoded.role != 1 && decoded.role != 0) {
            res.status(401);
            res.json({ err: 'Você não está autorizado a realizar está ação.' });
            return
        }
    
        next();

    } catch (error) {
        console.error(error);
        res.status(401);
        res.json({ err: 'Token inválido.' });
    }
}

module.exports = Auth;