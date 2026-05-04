const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: config.socket.corsOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use('/webhooks', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/generated-pdfs', express.static(path.resolve(config.pdf.storagePath)));

const { crSmokeModuleMarker } = require('./utils/reviewFlowSmoke');
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.get('/smoke', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), marker: crSmokeModuleMarker() });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
