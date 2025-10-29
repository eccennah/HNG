const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Country = sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    capital: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    population: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0
      }
    },
    currency_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: true
    },
    estimated_gdp: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true
    },
    flag_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'countries',
    timestamps: false,
    indexes: [
      { fields: ['region'] },
      { fields: ['currency_code'] },
      { fields: ['name'] }
    ]
  });

  return Country;
};