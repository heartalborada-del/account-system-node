const {Sequelize, DataTypes} = require("sequelize");

const cp = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "mysql",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            dateStrings: true,
            typeCast: true
        },
        logging:false
    }
);

const users = cp.define('User',
    {
        UUID: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: "account"
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_verify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        permission:{
            type: DataTypes.TINYINT,
            defaultValue: 0
        }
    },
    {
        tableName: process.env.DB_PERFIX + 'Users',
        indexes: [
            {
                unique: true,
                fields: ['email','UUID']
            }
        ]
    }
)

cp.sync({
    alter: true
});

module.exports = {cp,users};