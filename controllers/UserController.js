const PasswordToken = require('../models/PasswordToken');
const User = require('../models/User');

class UserController {

    async findOne(req, res) {
        const { param } = req.params
        
        try {
            let user;

            if (isNaN(param)) { // email
                user = await User.findByMail(param)

            } else if (!isNaN(param)) { // id
                user = await User.findById(param)
            } else {
                throw { code: 'Email ou ID inválido', no: 406 };
            }

            if (!user) {
                throw { code: 'Not found.', no: 404 };
            } else {
                res.status(200);
                res.json(user)
            }

        } catch (error) {
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error)
            }
        }
    }

    async findAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.status(200);
            res.json(users);

        } catch (error) {
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error)
            }
        }
    }

    async create(req, res) {
        const { email, name, password, role } = req.body

        try {
            if (!name || name.length <= 2 || /\d/.test(name)) {
                throw { code: 'Nome Inválido.', no: 406 };

            } else if (!email || !email.includes('@') || !email.includes('.') || email.length < 5) {
                throw { code: 'Email Inválido.', no: 406 };

            } else if (!password || password.length < 8) {
                throw { code: 'Senha inválida.', no: 406 };

            } else if (role && (role < 0 || isNaN(role))) {
                throw { code: 'Cargo inválido.', no: 406 };

            } else {
                const userCadastrado = await User.create(email, name, password, role);

                res.status(200);
                res.json(userCadastrado);
            }

        } catch (error) {
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error)
            }
        }

    }

    async update(req, res) {
        const { id } = req.params
        const { email, name, role } = req.body

        try {
            // NOTA IMPORTANTE PARA FUTUROS PROJETOS
            // começar a fazer validações somente com RegEx.
            if (isNaN(id)) {
                throw { code: 'ID Inválido.', no: 406 }
            }

            if (name && (name.length < 2 || /\d/.test(name))) {
                throw { code: 'Nome inválido.', no: 406 };

            }
            if (email) {
                if (!email.includes('@') || !email.includes('.') || email.length < 5) {
                    throw { code: 'Email inválido', no: 406 };
                }

            }

            await User.update(id, email, name, role);
            
            const updatedUser = await User.findById(id);

            res.status(200);
            res.json(updatedUser);

        } catch (error) {
            if (error.code) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error)
            }
        }
    }

    async remove(req, res) {
        const { id } = req.params

        try {
            if (isNaN(id)) {
                throw { code: 'ID Inválido.', no: 406 }
            }

            await User.remove(id);

            await User.findAll();

            res.status(204);
            res.send();

        } catch (error) {
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error)
            }
        }
    }

    async passwordRecover(req, res) {
        const { email } = req.params

        try {
            if (!email.includes('@') || !email.includes('.') || email.length < 5) {
                throw { code: 'Email Inválido.', no: 406 };
            }

            const user = await User.findByMail(email);

            if (!user) {
                throw { code: 'Usuário não encontrado.', no: 404 };
            }

            const token = await PasswordToken.create(email);

            // const accountTemp = await nodemailer.createTestAccount();

            await PasswordToken.sendTokenByMail(email, user.name, token);

            res.status(200);
            res.send(`Token enviado para o email ${email}.`);

        } catch (error) {
            
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error);
            }
        }
    }

    async passwordChange(req, res) {
        const { email, password, token } = req.body

        try {
            const token_user = await PasswordToken.authenticate(email, token);

            if (!token_user) {
                throw { code: 'Token inválido.' , no: 406 };
            }

            await User.updatePassword(token_user.user_id, password);

            await PasswordToken.invalidateToken(token);

            res.status(200);
            res.json(password);

        } catch(error) {
            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });
            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error);
            }
        }
    }

    async login(req, res) {
        const { email, password } = req.body

        try {

            if (!email || !email.includes('@') || !email.includes('.') || email.length < 5) {
                throw { code: 'Email Inválido.', no: 406 };
            }
    
            const token = await User.login(email, password);
            
            res.status(200);
            res.json({ token });

        } catch (error) {

            if (error.no) {
                res.status(error.no);
                res.json({ err: error.code });

            } else {
                res.status(500);
                res.json({ err: 'Internal Error.' });
                console.log(error);
            }
        }

    }

}

module.exports = new UserController();