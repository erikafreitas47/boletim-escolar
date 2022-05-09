const express = require("express");
const app = express();
const port = 7080;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());

var pg = require("pg");
var consString = "postgres://utosdvghfesxou:51c0c7ce02038f19dfba3465ebc8fc4d70bdf489a90019207e90f323ac8f677b@ec2-3-231-82-226.compute-1.amazonaws.com:5432/d6i8togtmek1kr";

const pool = new pg.Pool ( { connectionString: consString, ssl: { rejectUnauthorized: false } } );

//PESSOAS

//teste de conexão com o banco de dados
app.get('/', (request, response) => {
    pool.connect((err, client) => {
        if ( err ) {
            return response.status(401).send("Conexão não autorizada.", err);
        }
        response.status(200).send("Conectado ao banco de dados com sucesso.");
    })
})

//todas as pessoas da entidade tabela
app.get('/pessoa', (request, response) => {
    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada.", err);
        }

        client.query('select * from pessoa', (error, result) => {
            if (error) {
                return response.status(401).send("Operação não autorizada.");
            }
            response.status(200).send(result.rows);
        })
    })
})

//buscar pessoa por email
app.get('/pessoa/:email', (request, response) => {
    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada.");
        }

        client.query('select * from pessoa where email = $1', [request.params.email], (error, result) => {
            if (error){
                return response.status(401).send("Operação não autorizada.");
            }
            
            response.status(200).send(result.rows[0]);
        })
    })
})

//cadastrar nova pessoa
app.post('/pessoa', (request, response) => {

    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada.");
        }

        client.query('select * from pessoa where email = $1', [request.body.email], (error, result) => {
            if (error) {
                return response.status(401).send("Operação não autorizada");
            }

            if (result.rowCount > 0) {
                return response.status(200).send("Registro já existe!");
            }

            bcrypt.hash(request.body.senha, 10, (error, hash) => {
                if (error) {
                    return response.status(500).send(
                        {
                            message: "Erro de autenticação.",
                            erro: error.message
                        }
                    )
                }

                var sql = 'insert into pessoa(nome, genero, datanasc, cep, rua, numero, bairro, cidade, uf, telefone, email, login, senha, tipo_pessoa, ativo) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)';
                var valores = [request.body.nome, request.body.genero, request.body.datanasc, request.body.cep, request.body.rua, request.body.numero, request.body.bairro, request.body.cidade, request.body.uf, request.body.telefone, request.body.email, request.body.login, hash, request.body.tipo_pessoa, request.body.ativo];
                
                client.query(sql,valores, (error, result) => {
                    if (error) {
                        return response.status(403).send("Operação não permitida.");
                    }
    
                    response.status(201).send({mensagem: 'Usuário criado com sucesso!'});
                })
            })
        })
    })
})

//ainda testar
app.post('/pessoa/login', (request, response) => {
    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada")
        }

        client.query('select * from usuarios where email = $1', [request.body.login], (error, result) => {
            if (error) {
                return response.status(401).send('operação não permitida')
            }

            if (result.rowCount > 0) {
                //cripotgrafar a senha enviada e comparar com a recuperada do banco

                bcrypt.compare(request.body.senha, result.rows[0].senha, (error, results) => {
                    
                    if (error) {
                        return response.status(401).send({
                            message: "Falha na autenticação"
                        })
                    }

                    if (results) { //geração do token

                        let token = jwt.sign({
                                email: result.rows[0].email,
                                login: result.rows[0].perfil
                            },
                            process.env.JWTKEY, { expiresIn: '1h' })
                            
                        return response.status(200).send({
                            message: 'Conectado com sucesso',
                            token: token
                        })
                    }
                })
            } else {
                return response.status(200).send({
                    message: 'usuário não encontrado'
                })
            }
        })
    })
})

//atualizar dados da pessoa
app.patch('/pessoa/:email', (request, response) => {
    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada.");
        }

        client.query('select * from pessoa where email = $1', [request.params.email], (error, result) => {
            if (error) {
                return response.status(401).send("Operação não permitida 1.");
            }

            if (result.rowCount > 0) {

                var sql = 'update pessoa set nome=$1, genero=$2, datanasc=$3, cep=$4, rua=$5, numero=$6, bairro=$7, cidade=$8, uf=$9, telefone=$10, email=$11, login=$12, senha=$13, tipo_pessoa=$14, ativo=$15 where email=$16'
                var valores = [request.body.nome, request.body.genero, request.body.datanasc, request.body.cep, request.body.rua, request.body.numero, request.body.bairro, request.body.cidade, request.body.uf, request.body.telefone, request.body.email, request.body.login, request.body.senha, request.body.tipo_pessoa, request.body.ativo, request.params.email];

                client.query(sql, valores, (error2, result2) => {
                    if (error2) {
                        return response.status(401).send({
                            message: "Operação não permitida 2.",
                            error: error2.message 
                        });
                    }

                    if (result2.rowCount > 0) {
                        return response.status(200).send("Registro alterado com sucesso!");
                    }
                })
            } else {
                response.status(200).send("Registro de Pessoa não encontrado.");
            }
        })

    })

})

//deletar pessoa
app.delete('/pessoa/:email', (request, response) => {
    pool.connect((err, client) => {
        if (err) {
            return response.status(401).send("Conexão não autorizada.");
        }

        client.query('delete from pessoa where email = $1', [request.params.email], (error, result) => {
            if (error) {
                return response.status(401).send("Operação não permitida.");
            }

            if (result.rowCount == 0){
                return response.status(402).send("Registro não encontrado.");
            }

            response.status(200).send("Registro deletado com sucesso.");
        })

    })
})

//
app.listen(port, () => {
    console.log(`Servidor de Pessoa rodando na porta ${port}`);
});