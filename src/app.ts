import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './config/openapi';

import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/user/user.route';
import { errorHandler } from './middlewares/errorHandler';
import { httpLogger } from './middlewares/logger';

const app = express();

// Middlewares
app.use(httpLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// OpenAPI Documentation Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

// Global Error Handler
app.use(errorHandler);

export default app;
