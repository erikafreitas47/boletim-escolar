const express = require("express");
const app = express();
const cors = require("cors");
const port = 7080;

var dados = require("./databasePessoa");

//middleware para utilizar urlencoded
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//middleware cors
app.use(cors());

//PESSOAS

app.get('/pessoas', (request, response) => {
    response.status(200).send(
        {
            message: 'Lista de todas as pessoas cadastradas:',
            dados
        }
    )
})

app.get('/pessoas/:idPessoa', (request, response) => {
    let idPessoa = request.params.idPessoa;
    let pessoaEncontrada = {}
    for (let i of dados) {
        if (i.id == idPessoa){
            pessoaEncontrada = i;
        }
    }
    response.status(200).send(
        {
            message: 'Pessoa encontrada através do ID:',
            pessoaEncontrada
        }
    )
})

app.post('/pessoas/cadastrar', (request, response) => {
    let novaPessoa = {
        id: dados.length + 1,
        nome: request.body.nome,
        genero: request.body.genero,
        dataNascimento: request.body.dataNascimento,
        cep: request.body.cep,
        rua: request.body.rua,
        numero: request.body.numero,
        bairro: request.body.bairro,
        cidade: request.body.cidade,
        uf: request.body.uf,
        telefone: request.body.telefone,
        email: request.body.email,
        login: request.body.login,
        senha: request.body.senha,
        tipoPessoa: request.body.tipoPessoa,
        ativo: request.body.ativo
    }
    
    dados.push(novaPessoa);
    response.status(201).send(
        {
            message: 'Pessoa cadastrada com sucesso!',
            novaPessoa
        }
    )
})

app.put('/pessoas/atualizar/:idPessoa', (request, response) => {
    let idPessoa = request.params.idPessoa;
    let pessoaAtualizada = {}
    for (let i of dados){
        if (i.id == idPessoa){
            i.nome = request.body.nome,
            i.genero = request.body.genero,
            i.dataNascimento = request.body.dataNascimento,
            i.cep = request.body.cep,
            i.rua = request.body.rua,            
            i.numero = request.body.numero,
            i.bairro = request.body.bairro,
            i.cidade = request.body.cidade,
            i.uf = request.body.uf,
            i.telefone = request.body.telefone,
            i.email = request.body.email,
            i.login = request.body.login,
            i.senha = request.body.senha,
            i.tipoPessoa = request.body.tipoPessoa,
            i.ativo = request.body.ativo
            pessoaAtualizada = i
        }
    }
    response.status(200).send(
        {
            message: 'Pessoa atualizada com sucesso!',
            pessoaAtualizada
        }
    )
})

app.delete('/pessoas/deletar/:idPessoa', (request, response) => {
    let idPessoa = request.params.idPessoa;
    let posicao = 0;
    for (let i of dados){
        if (i.id == idPessoa){
            break;
        }
        posicao++
    }
    dados.splice(posicao, 1);
    response.status(200).send(
        {
            message: 'Pessoa deletada com sucesso!'
        }
    )
})


//
app.listen(port, () => {
    console.log(`Servidor de Pessoa rodando na porta ${port}`);
});