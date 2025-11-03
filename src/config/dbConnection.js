const { Sequelize } = require('sequelize');
require ('dotenv').config();

const sequelize =  new Sequelize( 
    process.env.DB_NAME, 
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT ,
            timezone: '+00:00',
            keepAlive: true,
        dialectOptions: {
      connectTimeout: 60000, // waits longer before timeout
    },
    pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
    }
});
    const dbconnection = async ()=>{
try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
};
module.exports = { sequelize,dbconnection }

