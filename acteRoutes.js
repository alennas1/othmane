
const express = require('express');
const app = express();
const authRoute = require('./routes/authRoute'); // Corrected require statement
const patientRoutes = require('./routes/patientRoutes'); // Corrected require statement
const maladieRoutes = require('./routes/maladieRoutes'); // Corrected require statement
const allergieRoutes = require('./routes/allergieRoutes'); // Corrected require statement
const acteRoutes = require('./routes/acteRoutes'); // Corrected require statement


// Middleware
app.use(express.json());

// Routes

//main route
app.get('/', (req, res) => {
  res.send('TASK MANAGER APP');
});

app.use('/api/auth', authRoute); //authentification

app.use('/api/patient', patientRoutes); //patient

app.use('/api/maladie', maladieRoutes); //maladie

app.use('/api/allergie', allergieRoutes); //allergie

app.use('/api/acte', acteRoutes); //acte_dentaire



const port = 3000;
app.listen(port, () => {
  console.log('Server is listening on port ' + port + '...');
});
