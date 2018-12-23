const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');

const {eAdmin} = require('../helpers/eAdmin');

//definição das rotas administrativas
router.get('/', eAdmin, (req, res) =>{
  res.render('admin/index')
});
router.get('/posts', eAdmin, (req, res) =>{
  res.send('pagina de posts');
});
router.get('/categorias', eAdmin, (req, res) =>{
  Categoria.find().then((categorias) =>{
    res.render('admin/categorias', {categorias: categorias});
  }).catch((error) => {
    req.flash('error_msg', 'Erro ao listar categorias');
    res.redirect('/admin');
  });
});
router.get('/categorias/add', eAdmin, (req, res) =>{
  res.render('admin/addcategorias');
});
router.post('/categorias/nova', eAdmin, (req, res) =>{
  var erros = [];
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: 'Nome invalido'});
  }
  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: 'Slug invalido'});
  }
  if (req.body.nome.length < 2) {
    erros.push({texto: 'Nome pequeno'});
  }
  if (erros.length > 0) {
    res.render('admin/addcategorias', {erros: erros});
  }else{
    const novaCategoria ={
      nome: req.body.nome,
      slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(() =>{
      req.flash('success_msg', 'Categoria registrada com sucesso');
      res.redirect('/admin/categorias');
    }).catch((erro) =>{
      //console.log('Erro ao salvar categoria: '+erro);
      req.flash('error_msg', 'Erro ao salvar categoria');
      res.redirect('/admin');
    });
  }
  });
  router.post('/categorias/edit', eAdmin, (req, res)=> {
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;
      categoria.save().then(()=>{
        req.flash('success_msg', 'Categoria Editada com sucesso');
        res.redirect('/admin/categorias');
      }).catch((erro)=>{
          req.flash('error_msg', 'Erro ao Editar categoria');
          res.redirect('/admin/categorias');
      });
    }).catch((erro) =>{
      req.flash('error_msg', 'Erro ao editar a categoria');
      res.redirect('/admin/categorias');
    });
  });
  router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
      req.flash('success_msg', 'Categoria deletada com sucesso');
      res.redirect('/admin/categorias');
    }).catch((erro)=> {
      req.flash('error_msg', 'Houve um erro ao deletar a categoria');
      res.redirect('/admin/categorias');
    });
  });

  router.get('/categorias/edit/:id', eAdmin, (req, res) =>{
  Categoria.findOne({_id: req.params.id}).then((categoria)=>{
    res.render('admin/editcategorias', {categoria: categoria});
  }).catch((erro) =>{
    req.flash('error_msg', 'Esta categoria não existe');
    res.redirect('/admin/categorias');
  });
});
  router.get('/postagens', eAdmin, (req, res)=>{
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens});
    }).catch((erro)=>{
      req.flash('error_msg', 'Erro ao listar postagens: '+ erro);
      res.redirect('/admin');
    });
  });
  router.get('/postagens/add', eAdmin, (req, res)=>{
    Categoria.find().then((categorias)=>{
        res.render('admin/addpostagens', {categorias: categorias});
    }).catch((erro) =>{
      req.flash('error_msg', 'Erro ao carregar formulario'+ erro);
      res.redirect('/admin');
    });
  });
  router.post('/postagens/nova', eAdmin, (req, res)=>{
    var erros = []
    if (req.body.categoria == '0') {
      erros.push({texto: 'Categoria invalida'});
    }
    if (erros.length > 0) {
      res.render('admin/addpostagens', {erros: erros});
    }else{
      const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug
      }
      new Postagem(novaPostagem).save().then(()=>{
        req.flash('success_msg', 'Postagem criada com sucesso');
        res.redirect('/admin/postagens');
      }).catch((erro)=>{
        req.flash('error_msg', 'Erro ao criar uma postagem');
        res.redirect('/admin/postagens');
      });
    }
  });
  router.get('/postagens/edit/:id', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
      Categoria.find().then((categorias)=>{
          res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
      }).catch((erro)=>{
        req.flash('error_msg', 'Erro ao listar as categorias: '+erro);
        res.redirect('/admin/postagens');
      });
    }).catch((erro)=>{
      req.flash('error_msg', 'Erro ao carregar formulario de ediçao de postagem: '+erro);
      res.redirect('/admin/postagens');
    });
  });
  router.post('/postagens/edit', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;
      postagem.save().then(()=>{
        req.flash('success_msg', 'Postagem editada com sucesso');
        res.redirect('/admin/postagens');
      }).catch((erro)=>{
        req.flash('error_msg', 'Erro interno: '+erro);
        res.redirect('/admin/postagens');
      });
    }).catch((erro)=>{
      req.flash('error_msg', 'Erro ao editar postagem: '+erro);
      res.redirect('/admin/postagens');
    });
  });
  router.get('/postagens/deletar/:id', eAdmin, (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
      req.flash('success_msg', 'Postagem deleta com sucesso');
      res.redirect('/admin/postagens');
    }).catch((erro)=>{
      req.flash('error_msg', 'Houve um erro interno');
      res.redirect('/admin/postagens');
    });
  });
module.exports = router;
