//carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
require('./models/Categoria');
const Postagem = mongoose.model('postagens');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuario');
const passport = require('passport');
require('./config/auth')(passport);
const db = require('./config/db');
require('./models/Usuario');
const Usuario = mongoose.model('usuarios');
//condfiguraçoes
  //sessao
  app.use(session({
    secret: 'Node JS',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  //Middleware
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });
  //bodyParser
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  //handlebars
  app.engine('handlebars', handlebars({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');
  //mongoose
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://adm:qwerty123@ds037488.mlab.com:37488/bancodeteste-teste').then(() => {
    console.log('conectado com sucesso!');
  }).catch((erro) => {
    console.log('Erro ao se conectar: '+erro);
  });

  //public
    app.use(express.static(path.join(__dirname, 'public')));

    // app.use((req, res, next) => {
    //     console.log('OI WITH MIDDLEWRE');
    //     next();
    // });

//rotas
    app.get('/', (req, res) => {
      Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('index', {postagens: postagens});
      }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro interno: '+erro);
        res.redirect('/404');
      });
    });
    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
          if(postagem){
            res.render('postagem/index', {postagem: postagem});
          }else{
            req.flash('error_msg', 'Esta postagem nao existe');
            res.redirect('/');
          }
        }).catch((erro)=>{
          req.flash('error_msg', 'Erro interno');
          res.redirect('/');
        });
    });
    app.get('/404', (req, res)=>{
      res.send('Error 404');
    });
    app.get('/categorias', (req,res)=>{
      Categoria.find().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias});
      }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro interno ao listar as categorias');
        res.redirect('/');
      });
    });
    app.get('/categorias/:slug', (req,res)=>{
      Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
        if (categoria) {
          Postagem.find({categoria: categoria._id}).then((postagens) => {
            res.render('categorias/postagens', {postagens: postagens, categoria: categoria});
          }).catch((erro)=>{
            req.flash('error_msg', 'Houve um erro ao listar os posts');
            res.redirect('/');
          });
        }else{
          req.flash('error_msg', 'Esta categoriaaaa nao existe');
          res.redirect('/');
        }
      }).catch((erro)=>{
        req.flash('error_msg', 'Houve um erro interno ao carregar a pagina desta categoria');
        res.redirect('/');
      });
    });

    app.get('/chat/:email', (req, res)=>{
      Usuario.findOne({email: req.params.email}).then((usuario)=>{
        if (usuario) {
          res.render('usuarios/chat', {usuario: usuario});
        }else{
          req.flash('error_msg', 'erro interno reve-lo');
          res.redirect('/usuarios/registro');
        }
      });
      });
      
      let messages = [];

      io.on('connection', socket =>{
      socket.emit('previousMessages', messages);
      socket.on('sendMessage', data =>{
      messages.push(data);
      socket.broadcast.emit("receivedMessage", data);
  });
});

    app.use('/admin', admin);//grupo de rotas
    app.use('/usuarios', usuarios);

//outros
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log('Servidor rodando na porta: '+PORT);
});
