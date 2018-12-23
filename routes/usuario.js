const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');
//require('./config/auth')(passport);

router.get('/registro', (req, res)=>{
  res.render('usuarios/registro');
});

router.post('/registro', (req, res)=>{
  var erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto: 'Nome invalido'});
  }
  if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    erros.push({texto: 'Email invalido'});
  }
  if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
    erros.push({texto: 'Senha invalida'});
  }
  if (req.body.senha.length < 4) {
    erros.push({texto: 'Senha curta'});
  }
  // if (req.body.senha != req.body.senha2) {
  //   erros.push({texto: 'Senhas diferentes'});
  // }
  if (erros.length > 0) {
    res.render('usuarios/registro', {erros: erros});
  }else{
    Usuario.findOne({email: req.body.email}).then((usuario)=>{
      if (usuario) {
        req.flash('error_msg', 'Ja existe um conta com este e-mail');
        res.redirect('/usuarios/registro');
      }else{
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha
        });
        bcrypt.genSalt(10, (erro, salt)=>{
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
            if (erro) {
              req.flash('error_msg', 'Houve um erro ao salvar usuario');
              res.redirect('/');
            }else{
              novoUsuario.senha = hash;
              novoUsuario.save().then(()=>{
                req.flash('success_msg', 'Usuario criado com sucesso');
                res.redirect('/');
              }).catch((erro)=>{
                req.flash('error_msg', 'Houve um erro ao criar um usuario'+ erro);
                res.redirect('/usuarios/registro');
              });
            }
          });
        });
      }
    }).catch((erro)=>{
      req.flash('error_msg', 'Erro interno: '+erro);
      res.redirect('/');
    });
  }
});
  router.get('/login', (req, res)=>{
    res.render('usuarios/login');
  });
  router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/usuarios/login',
      failureFlash: true
    })(req, res, next);
    //res.render('usuarios/login');
  });
  router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'Voce se deslogou!');
    res.redirect('/')
  });
module.exports = router;
