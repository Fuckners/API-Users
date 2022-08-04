const database = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = require('../secret');

// Service
class User {

    async findAll () {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await database.select([ 'id', 'email', 'name', 'role' ]).from('users');
                
                resolve(users);
                
            } catch (error) {
                console.log(error);
                reject({ code: 'Internal Error', no: 500 })
            }
        })
    }

    async findById (id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!id) {
                    throw { code: 'ID inválido.', no: 406 };
                }

                const [ user ] = await database.select([ 'id', 'email', 'name', 'role' ]).from('users').where({ id });

                resolve(user);
                
            } catch (error) {
                if (error.no) {
                    reject(error);
                  } else {
                    console.log(error);
                    reject({ code: 'Internal Error', no: 500 });
                  }
            }
        })
    }

    async findByMail (email) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!email) {
                    throw { code: 'Email inválido.', no: 406 };
                }
                const [ user ] = await database.select([ 'id', 'email', 'name', 'role' ]).table('users').where({ email });

                resolve(user);
    
            } catch (error) {
                if (error.no) {
                    reject(error);
                  } else {
                    console.log(error);
                    reject({ code: 'Internal Error', no: 500 });
                  }
            }
        })
    }

    async create (email, name, password, role = 0) {
        return new Promise(async (resolve, reject) => {
            try {

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                {
                    const user = await this.findByMail(email);
                    if (user) {
                        throw { code: 'Email já cadastrado!', no: 406 };
                    }
                }

                await database.insert({ email, name, password: hash, role }).into('users');

                const user = await this.findByMail(email);

                resolve(user);
            } catch (error) {
                if (error.no) {
                    reject(error);
                } else {
                    console.log(error);
                    reject({ code: 'Internal Error', no: 500 });
                }
            }
        })
    }

    async update (id, email, name, role) {
        // acho que deveria dar para atualizar a senha também.
        return new Promise(async (resolve, reject) => {
            try {
                // verificando se usuário já existe
                const user = await this.findById(id);
                if (!user) {
                    throw { code: 'Usuário não encontrado.', no: 404 };
                }

                if (email === user.email) {
                    email = undefined
                } else {
                    const userMail = await this.findByMail(email);
                    if (userMail) {
                        throw { code: 'Email já cadastrado.', no: 406 };
                    }
                }

                // atualizando dados no database.
                await database.update({ email, name, role }).table('users').where({ id });
                resolve();

            } catch (error) {
                if (error.no) {
                    reject(error);
                  } else {
                    console.log(error);
                    reject({ code: 'Internal Error', no: 500 });
                  }
            }
        })
    }

    async remove (id) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.findById(id);
            
                if (!user) {
                    throw { code: 'Usuário não encontrado.', no: 404 };
                }
    
                await database.delete().table('users').where({ id });

                resolve();
    
            } catch (error) {
                if (error.no) {
                    reject(error);
                } else {
                    console.log(error);
                    reject({ code: 'Internal Error', no: 500 });
                }
            }
        })
    }

    async updatePassword (id, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.findById(id);

                if (!user) {
                    throw { code: 'Usuário não encontrado.', no: 404 };
                }

                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);

                await database.update({ password: hash }).table('users').where({ id });
                resolve();
            } catch (error) {
                if (error.no) {
                    reject(error);
                } else {
                    reject({ code: 'Internal Error.', no: 500 });
                    console.log(error);
                }
            }
        })
    }

    async login (email, password) {
        return new Promise(async (resolve, reject) => {
            try {

                // aqui não usei this.findByMail(email), pq ele não retornaria a senha do usuário.
                const [user] = await database.select('*').table('users').where({ email });

                if (!user) {
                    throw { code: 'Usuário não encontrado.', no: 404 };
                }

                const valid = await bcrypt.compare(password, user.password);

                if (!valid) {
                    throw { code: 'Email e/ou senha incorreta.', no: 401 };
                }

                const token = jwt.sign({ email, role: user.role }, secret, { expiresIn: '2 days' });

                resolve(token);

            } catch (error) {

                if (error.no) {
                    reject(error);

                } else {
                    reject({ code: 'Internal Error.', no: 500 });
                    console.log(error);
                }
            }
        })
    }
}

module.exports = new User();