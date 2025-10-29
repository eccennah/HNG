const axios = require('axios');
const { Country } = require('../models');
const { Op } = require('sequelize');

class CountryService {
  
  async fetchExternalData() {
    try {
      // Fetch countries
      const countriesResponse = await axios.get(
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
        { timeout: 15000 }
      );

      // Fetch exchange rates
      const exchangeResponse = await axios.get(
        'https://open.er-api.com/v6/latest/USD',
        { timeout: 15000 }
      );

      return {
        countries: countriesResponse.data,
        exchangeRates: exchangeResponse.data.rates
      };
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout while fetching data');
      }
      if (error.response) {
        throw new Error(`Could not fetch data from ${error.config.url}`);
      }
      throw error;
    }
  }

  calculateEstimatedGDP(population, exchangeRate) {
    if (!exchangeRate || exchangeRate === 0) return 0;
    const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
    return (population * randomMultiplier) / exchangeRate;
  }

  async refreshCountries() {
    const { countries, exchangeRates } = await this.fetchExternalData();
    
    const processedCountries = [];

    for (const country of countries) {
      let currencyCode = null;
      let exchangeRate = null;
      let estimatedGdp = 0;

      // Extract first currency code
      if (country.currencies && country.currencies.length > 0) {
        currencyCode = country.currencies[0].code;

        // Get exchange rate if currency exists
        if (currencyCode && exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
          estimatedGdp = this.calculateEstimatedGDP(country.population, exchangeRate);
        }
      }

      const countryData = {
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGdp,
        flag_url: country.flag || null,
        last_refreshed_at: new Date()
      };

      // Upsert country (update if exists, insert if not)
      await Country.upsert(countryData, {
        conflictFields: ['name']
      });

      processedCountries.push(countryData);
    }

    return processedCountries;
  }

  async getAllCountries(filters = {}) {
    const where = {};

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.currency) {
      where.currency_code = filters.currency;
    }

    const order = [];
    switch (filters.sort) {
      case 'gdp_desc':
        order.push(['estimated_gdp', 'DESC']);
        break;
      case 'gdp_asc':
        order.push(['estimated_gdp', 'ASC']);
        break;
      case 'name_desc':
        order.push(['name', 'DESC']);
        break;
      case 'name_asc':
      default:
        order.push(['name', 'ASC']);
    }

    return await Country.findAll({ where, order });
  }

  async getCountryByName(name) {
    return await Country.findOne({
      where: {
        name: {
          [Op.like]: name
        }
      }
    });
  }

  async deleteCountry(name) {
    const deleted = await Country.destroy({
      where: {
        name: {
          [Op.like]: name
        }
      }
    });
    return deleted > 0;
  }

  async getStatus() {
    const count = await Country.count();
    const lastRefresh = await Country.max('last_refreshed_at');
    
    return {
      total_countries: count,
      last_refreshed_at: lastRefresh
    };
  }
}

module.exports = new CountryService();