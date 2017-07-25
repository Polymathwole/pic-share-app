const express=require('express');
const app = express();
const exphbs=require('express-handlebars');
const hbs= exphbs.create({extname:'hbs',defaultLayout:'main'});
const routes= require('./lib/routes');
const credentials= require('./lib/credentials');
const session=require('express-session');
const cookiep=require('cookie-parser');
const bodyp=require('body-parser');
const expressValidator = require('express-validator');

app.engine('hbs',hbs.engine);
app.set('view engine','hbs');
app.use(express.static(__dirname+'/public'));
app.set('port',process.env.PORT||8080);

app.use(cookiep(credentials.cookiesecret));

app.use(session({secret:credentials.sessionsecret,saveUninitialized:false,resave:false}));

app.use(bodyp.urlencoded({extended:false}));
app.use(bodyp.json());
app.use(expressValidator({
  errorFormatter: (param, msg, value)=>{
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

routes(app);

app.listen(process.env.PORT||8080,()=>{
    console.log(`App in ${app.get('env')} on http://localhost:${app.get('port')}. Press Ctrl-C to terminate.`)
});