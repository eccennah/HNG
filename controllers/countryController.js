const countryService = require('../services/countryService');
const imageService = require('../services/imageService');

class CountryController {

  async refresh(req, res) {
    try {
      const countries = await countryService.refreshCountries();
      
      // Generate summary image after successful refresh
      await imageService.generateSummaryImage(countries);

      res.json({
        message: 'Countries refreshed successfully',
        total_countries: countries.length
      });
    } catch (error) {
      console.error('Refresh error:', error);
      
      if (error.message.includes('timeout') || error.message.includes('Could not fetch')) {
        return res.status(503).json({
          error: 'External data source unavailable',
          details: error.message
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getAll(req, res) {
    try {
      const filters = {
        region: req.query.region,
        currency: req.query.currency,
        sort: req.query.sort
      };

      const countries = await countryService.getAllCountries(filters);
      res.json(countries);
    } catch (error) {
      console.error('Get all countries error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async getOne(req, res) {
    try {
      const country = await countryService.getCountryByName(req.params.name);
      
      if (!country) {
        return res.status(404).json({
          error: 'Country not found'
        });
      }

      res.json(country);
    } catch (error) {
      console.error('Get country error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await countryService.deleteCountry(req.params.name);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Country not found'
        });
      }

      res.json({
        message: 'Country deleted successfully'
      });
    } catch (error) {
      console.error('Delete country error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = await countryService.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async getImage(req, res) {
    try {
      const imagePath = await imageService.getImagePath();
      
      if (!imagePath) {
        return res.status(404).json({
          error: 'Summary image not found'
        });
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new CountryController();