import express from 'express';
import cors from 'cors';
import invitationRoutes from './routes/invitation.routes';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API Routes
app.use('/api', invitationRoutes);

// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});