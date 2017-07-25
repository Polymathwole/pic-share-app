const firebase=require('firebase');
const credentials=require('./credentials');
firebase.initializeApp(credentials.firebaseconfig);
const auth=firebase.auth();
const dbref=firebase.database().ref('users');

auth.onAuthStateChanged((user)=>{
    if(user)
    {
        console.log(user.email)
    }
    else
        console.log('Not logged in')
})

errorFlash= (req,res,next)=>{
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('mail','E-mail is required').notEmpty();
    req.checkBody('pass','Password is required').notEmpty();
    req.checkBody('cpass','Password mismatch').equals(req.body.pass);
    
    res.locals.errors=req.validationErrors();
    next();
}

successFlash = (req,res,next)=>{
  res.locals.success=req.session.success;
  delete req.session.success;
  next();
}

module.exports=(app)=>{
    app.get('/',successFlash,(req,res)=>{
        res.render('home',{title:"PicShare | Homepage"})
    });

    app.get('/signup',(req,res)=>{
        res.render('signup',{title:"PicShare | Signup"})
    })

    app.post('/dashboard',(req,res)=>{
        let prom=auth.signInWithEmailAndPassword(req.body.email,req.body.pass);
        let chi = req.body.email.replace(/[\[\]._-]/,'');
        

        prom.then(()=>{
            let ds=new Date().toString();
            dbref.child(chi).update({lastsignin:ds});
            
            firebase.database().ref('users/'+chi).once('value').then((ss)=>{
            req.session.username=ss.val()['username'];
            //console.log(req.session.username);
            res.locals.un=req.session.username;
            res.render('dashboard',{title:"PicShare | Dashboard"});
        });

        }).catch((err)=>{
            console.log(err.message);
            res.locals.fail=err.message;
            res.render('home',{title:"PicShare | Homepage"})
        })
    })

    app.get('/dashboard',(req,res)=>{
            res.render('dashboard',{title:"PicShare | Dashboard"});
    })

    app.get('/logout',(req,res)=>{
        //console.log(req.session.username+' byeeee')
        req.session.destroy();
        
        auth.signOut().then(()=>{
            res.locals.success='User successfully signed out';
            res.render('home',{title:"PicShare | Homepage"});
        }).catch((e)=>{
            res.locals.fail=e.message;
            res.render('home',{title:"PicShare | Homepage"});
        });
    })

    app.post('/signup',errorFlash,(req,res)=>{
        if (res.locals.errors){
            res.render('signup',{title:"PicShare | Signup"})
        }
        else
        {
            auth.createUserWithEmailAndPassword(req.body.mail,req.body.pass).then(()=>{
                let dc=new Date().toString();
                auth.signOut();
                let ds=new Date().toString();
                let chi = req.body.mail.replace(/[\[\]._-]/,'');
                dbref.child(chi).set({username:req.body.username,created:dc,lastseen:ds});

                req.session.success='User created successfully. Log in';

                res.redirect(303,'/')
            }).catch((err)=>{
                res.locals.errors=[{msg:err.message}];
                res.render('signup',{title:"PicShare | Signup"})
            });
        }

    });
}