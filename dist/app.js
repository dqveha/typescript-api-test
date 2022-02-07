"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const connectionString = process.env.DATABASE_URL || '';
const connection = mysql_1.default.createConnection(connectionString);
connection.connect();
app.get('/api/characters', (req, res) => {
    const query = 'SELECT * FROM Characters';
    connection.query(query, (err, rows) => {
        if (err)
            throw err;
        const returnValue = {
            data: rows,
            message: rows.length === 0 ? 'No Record Found' : null
        };
        return res.send(returnValue);
    });
});
app.get('/api/characters/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM Characters WHERE ID = "${id}" LIMIT 1`;
    connection.query(query, (err, rows) => {
        if (err)
            throw err;
        const returnValue = {
            data: rows.length > 0 ? rows[0] : null,
            message: rows.length === 0 ? 'No Record Found' : ''
        };
        return res.send(returnValue);
    });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger_1.default.info("App is running");
});
