import express, {Request, Response} from 'express';
import mysql from 'mysql';
import logger from './utils/logger';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API Throne of Glass Web Scraper',
      description: 'Throne of Glass character web scraper',
      contact: {
        name: 'Dave'
      },
      version: "1.0",
      servers: ['http://localhost:3000']
    }
  },
  apis: ["**/*.ts"]
};
const app = express();

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const connectionString = process.env.DATABASE_URL || '';
const connection = mysql.createConnection(connectionString);
connection.connect();


// Routes
/**
 * @swagger
 * /api/characters:
 *  get:
 *    description: Use to request all characters
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/api/characters', (req: Request, res: Response) => {
  const query = 'SELECT * FROM Characters';
  
  connection.query(query, (err, rows) => {
    if (err) throw err;
    const returnValue  = {
      data: rows,
      message: rows.length === 0 ? 'No Record Found' : null
    }
    return res.send(returnValue);
  })
})

/**
 * @swagger
 * /api/characters/{id}:
 *  get:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        minimum: 1
 *        description: The character ID
 *    description: Use to request one character
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get('/api/characters/:id', (req: Request, res: Response) => {
  const id = req.params.id
  const query = `SELECT * FROM Characters WHERE ID = "${id}" LIMIT 1`;
  
  connection.query(query, (err, rows) => {
    if (err) throw err;
    const returnValue  = {
      data: rows.length > 0 ? rows[0] : null,
      message: rows.length === 0 ? 'No Record Found' : ''
    }
    return res.send(returnValue);
  })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info("App is running")
});