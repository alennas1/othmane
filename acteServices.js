const acteServices = require('../services/acteServices');

const getFicheDeSoinByPatient = async (req, res) => {
  const { patientId, dentistId } = req.params;
  const { state } = req.body;

  try {
    const actes = await acteServices.getFicheDeSoinByPatient(patientId, dentistId, state);
    res.json(actes);
  } catch (error) {
    if (error.message === 'No actes available') {
      return res.status(404).json({ error: 'No actes available' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getActeById = async (req, res) => {
    const { acteId,patientId, dentistId } = req.params;
  
    try {
      const acte = await acteServices.getActeById(acteId, patientId, dentistId);
      res.json(acte);
    } catch (error) {
      if (error.message === 'No acte available') {
        return res.status(404).json({ error: 'No acte available' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const addActe = async (req, res) => {
    const {patientId, dentistId } = req.params;
    const { dent, nomActe} = req.body;
  try {
    const acte = await acteServices.addActe(patientId, dentistId, dent, nomActe);
    res.json(acte);
  } catch (error) {
    console.error('API error:', error.message);
    if (error.message === 'Issues with creation') {
      return res.status(400).json({ error: 'Issues with creation' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const softDeleteActeById = async (req, res) => {
    const { acteId,patientId, dentistId } = req.params;

  try {
    const softDeletedacte = await acteServices.softDeleteActeById(acteId, patientId, dentistId);
    res.json(softDeletedacte);
  } catch (error) {
    console.error('API error:', error.message);
    if (error.message === 'Issues with deletion') {
      return res.status(400).json({ error: 'Issues with deletion' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateActeById = async (req, res) => {
    const { acteId,patientId, dentistId } = req.params;
    const { dent, nomActe} = req.body;
  try {
    const updatedActe = await acteServices.updateActeById(acteId, patientId, dentistId, dent, nomActe);
    res.json(updatedActe);
  } catch (error) {
    console.error('API error:', error.message);
    if (error.message === 'Issues with update') {
      return res.status(400).json({ error: 'Issues with update' });
    }
    if (error.message === 'acte does not exist in predefined list') {
      return res.status(400).json({ error: 'acte does not exist in predefined list' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateActeStateById= async (req, res) => {
    const { acteId,patientId, dentistId } = req.params;
    const { state} = req.body;
  try {
    const updatedActe = await acteServices.updateActeStateById(acteId, patientId, dentistId, state);
    res.json(updatedActe);
  } catch (error) {
    console.error('API error:', error.message);
    if (error.message === 'Issues with state update') {
      return res.status(400).json({ error: 'Issues with state update' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getRecetteARecevoirByDate = async (req, res) => {
  const {dentistId} = req.params;
  const {date} = req.body;
  try{
    const recette= await acteServices.getRecetteARecevoirByDate(dentistId, date);
    res.json(recette);

  }
  catch (error) {
    console.error('API error:', error.message);
    if (error.message === 'No recette available') {
      return res.status(400).json({ error: 'No recette available' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports = {
    getFicheDeSoinByPatient,
    getActeById,
    addActe,
    softDeleteActeById,
    updateActeById,
    updateActeStateById,
    getRecetteARecevoirByDate
};
