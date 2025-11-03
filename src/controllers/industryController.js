const { Industry } = require('../models');

// Create new Industry
const createIndustry = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false,error: 'Industry name is required' });
    const industry = await Industry.create({ name });
    res.status(201).json({success: true,industry});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all industries 

const getIndustries = async (req, res) => {
  try {
    const industries = await Industry.findAll({ order: [['name', 'ASC']] });
    res.json({success: true,industries});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Delete Industry
const deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Industry.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ success: false, error: 'Industry not found' });

    res.json({ success: true, message: 'Industry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false,error: error.message });
  }
};




module.exports = { createIndustry, getIndustries, deleteIndustry  }