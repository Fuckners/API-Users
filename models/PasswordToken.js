const database = require('../database/database');
const crypto = require('crypto');
const User = require('./User');

class PasswordToken {
    async create (email) {
        return new Promise(async (resolve, reject) => {
            try {
                
                const user = await User.findByMail(email);

                if (!user) {
                    throw { code: 'Usuário não encontrado.', no: 404 }
                }

                const token = crypto.randomUUID();

                await database.insert({ user_id: user.id, token, used: 0 }).table('password_tokens');
                resolve(token);

            } catch (error) {
                if (error.no) {
                    reject(error);
                } else {
                    console.log(error);
                    reject({ code: 'Internal Error.', no: 500 });
                }
            }
        })
    }

    async authenticate (email, token) {
        return new Promise(async (resolve, reject) => {
            try {
                
        
                const user = await User.findByMail(email);
    
                if (!user) {
                    throw { code: 'Usuário não existe.', no: 404 };
                }
        
                const [token_user] = await database.select('*').table('password_tokens').where({ token });

                if (!token_user) {
                    throw { code: 'Token inválido.', no: 400 };
                }
        
                if (token_user.used === 1) {
                    throw { code: 'Token expirado.', no: 400 };
                }
                
                // if (!user) {
                //     throw { code: 'Este usuário não possui um token de recuperação de senha.', no: 400 };
                // }
        
                // if (user.token !== token) {
                //     throw { code: 'Token não corresponde ao token do usuário.', no: 401 };
                // }

                resolve(token_user);
    
            } catch (error) {
                if (error.no) {
                    reject(error);
                } else {
                    console.log(error);
                    reject({ code: 'Internal Error.', no: 500 });
                }
            }
        })
    }

    async invalidateToken (token) {
        return new Promise(async (resolve) => {
            // creio que aqui eu poderia ou excluir o dado com esse token, ou só mudar o used para 1
            await database.update({ used: 1 }).table('password_tokens').where({ token });
            resolve();
        });
    }
}

module.exports = new PasswordToken();