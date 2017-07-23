const firebase=require('firebase');
const credentials=require('./credentials');
firebase.initializeApp(credentials.firebaseconfig);
const auth=firebase.auth();
const dbref=firebase.database().ref('users');

auth.onAuthStateChanged((user)=>{
    if(user)
        console.log(`${user} signed in`);
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

module.exports=(app)=>{
    app.get('/',(req,res)=>{
        res.render('home',{title:"PicShare | Homepage"})
    });

    app.get('/signup',(req,res)=>{
        res.render('signup',{title:"PicShare | Signup"})
    })

    app.post('/dash',(req,res)=>{
        let prom=auth.signInWithEmailAndPassword(req.body.email,req.body.pass);
        
        prom.then(()=>{
            let ds=new Date().toString();
            dbref.child(req.body.email.replace(/[\[\]._-]/,'')).update({lastsignin:ds});
            res.render('dashboard',{title:"PicShare | Dashboard"});
        }).catch((err)=>{
            console.log(err.message);
            res.locals.fail=err.message;
            res.render('home',{title:"PicShare | Homepage"})
        })
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

                res.locals.success='User created successfully. Log in';
                res.status(303);
                res.render('home',{title:"PicShare | Homepage"})
            }).catch((err)=>{
                res.locals.errors=[{msg:err.message}];
                res.render('signup',{title:"PicShare | Signup"})
            });
        }

    });
}