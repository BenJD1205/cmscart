var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
const Page = require('../model/page')

router.get('/', function(req,res,next){
    res.send('trangquantri');
});

router.get('/add-page', function(req,res,next) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add-page', {title,slug,content});
});

router.post('/add-page',[
    check('title', 'Title must have a value.').notEmpty(),
    check('content','Content must have a value.').notEmpty()
    ],
function(req,res,next){
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug =="") slug=title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    const errors = validationResult(req).errors;
    if(errors.length !=0) {
        res.render('admin/add-page', {errors,title,slug,content});
    }else {
        console.log('Chuyen du lieu vao database');
        Page.findOne({slug: slug}, function(err,page){
            if (page){
                req.flash('danger','Page slug exists, choose another');
                res.render('admin/add-page',{title,slug,content});
            }else {
                var page = new Page({title,slug,content,sorting: 100});
                page.save(function(err) {
                    if (err) 
                        return console.log(err);
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                })
            }
        });
    }
});

module.exports = router;