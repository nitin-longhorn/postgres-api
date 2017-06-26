let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
let cors = require('cors');
const PORT = 3000;

let pool = new pg.Pool({
  user: 'postgres',
  database: 'nimitharamesh',
	password: '',
	host: 'localhost',
	port: 5432,
	max: 10,
}); 

// Instantiate application
let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

// Cors on ExpressJS
app.use((request, response, next) => {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "Orign, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/api/movies', (request, response) => {
  pool.connect((err, db, done) => {
    if (err) {
      return response.status(400).send(err);
    } else {
      db.query('SELECT * from movies', (err, table) => {
        done();
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send(table.rows);
        }
      });
    }
  })
  
});

app.delete('/api/remove/:id', (request, response) => {
  var id = request.params.id;

  pool.connect((err, db, done) => {
    if (err) {
      return response.status(400).send(err);
    } else {
      db.query('DELETE FROM movies where id = $1', [id], (err, result) => {
        done();
        if (err) {
          return response.status(400).send(err);
        } else {
          return response.status(200).send({ message: 'Record successfully deleted!'});
        }
      });
    }
  });

});

app.post('/api/new-movie', (request, response) => {
  var movie_name = request.body.movie_name;
  var movie_date = request.body.movie_date;
  var location = request.body.location;
  var id = request.body.id;

  var values = [movie_name, movie_date, location, id];

  pool.connect((err, db, done) => {
   if (err) {
     return response.status(400).send(err);
   } else {
     db.query('INSERT INTO movies (movie_name, movie_date, location, id) VALUES ($1, $2, $3, $4)', [...values], (err, table) => {
        done();
        if (err) {
          return response.status(400).send(err);;
        } else {
          console.log('DATA INSERTED!');
          response.status(201).send({ message: 'Data inserted!' });
        }
      })
   }
  }); 
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));
