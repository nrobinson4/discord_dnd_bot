const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './database.sqlite',
});

const Users = sequelize.define('Users', {
    userId: {
        type: Sequelize.STRING,
        primaryKey: true,  // Make userId the primary key
        unique: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    characterClass: {
        type: Sequelize.STRING,
        allowNull: true,  // Allow null initially since it's set after registration
    },
    strengthStat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    dexterityStat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    intelligenceStat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    charismaStat: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    currentLocation: {
        type: Sequelize.STRING,
        defaultValue: 'home',
    },
    questProgress: {
        type: Sequelize.JSON,
        defaultValue: {},
    },
    journal: {
        type: Sequelize.JSON,
        defaultValue: {
            rumors: [],
            entries: []
        },
    },
    characterLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
    },
    experiencePoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    currentHealth: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
    },
    maxHealth: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
    },
});

const Locations = sequelize.define('Locations', {
    locationId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    locationName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    locationDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    availableActions: {
        type: Sequelize.JSON,
        defaultValue: [],
    },
    examineText: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

module.exports = { sequelize, Users, Locations};