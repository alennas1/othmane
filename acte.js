const db = require('../config/db'); // Ensure db is properly configured for Knex

// Fetch all actes associated with a specific patient and dentist ID
async function getFicheDeSoinByPatient(patientId, dentistId,state) {
    try {
        const query = db('acte_dentaire')
            .where({ id_patient: patientId, id_dentiste: dentistId }) // Ensure column names match your schema
            .whereNull('deleted_at'); // Check for null deleted_at to ensure the record is not soft-deleted

        // Add state filter if provided
        if (state) {
            query.andWhere({ etat: state });
        }

        // Execute the query
        const actes = await query;

        return actes;
    } catch (error) {
        console.error('Error fetching actes:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
}

async function getActeById(acteId, patientId, dentistId) {
    const isActive = await isActeActive(acteId, patientId, dentistId);
    if (!isActive) {
        throw new Error('acte is deleted');
    }
    try {
        const acte = await db('acte_dentaire') // Replace 'patient' with your actual table name
            .where({ id_acte: acteId, id_patient: patientId , id_dentiste: dentistId }) // Adjust the column name to match your schema
            .whereNull('deleted_at'); // Check for null deleted_at to ensure the record is not soft-deleted

        return acte; // Corrected the return variable name
    } catch (error) {
        console.error('Error fetching actes:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
}

async function addActe(patientId, dentistId, dent, nomActe) {
    try {
        // Check if the acteNom exists in acte_predefinis
        const actepre = await db('acte_dentaire_predefinis')
            .where({ nom_acte: nomActe })
            .first();
        
        if (!actepre) {
            throw new Error('acte does not exist in predefined list');
        }

        const prix_Acte = actepre.prix;

        // Proceed with adding the new acte
        const [acteId] = await db('acte_dentaire').insert({
            dent: dent,
            nom_acte: nomActe,
            id_dentiste: dentistId,
            id_patient: patientId,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        });

        return { acteId, prix_Acte }; // Return the inserted acte ID with the price
    } catch (error) {
        console.error('Database insertion error:', error);
        throw error;
    }
}

async function softDeleteActeById(acteId, patientId, dentistId) {
    const isActive = await isActeActive(acteId, patientId, dentistId);
    if (!isActive) {
        throw new Error('acte is already deleted');
    }
    try {
        // Perform the update operation
        const affectedRows = await db('acte_dentaire')
            .where({ id_acte: acteId, id_patient: patientId, id_dentiste: dentistId }) 
            .update({
                deleted_at: new Date(),
            });

        // Check if any rows were affected
        if (affectedRows === 0) {
            throw new Error('acte not found or no changes made');
        }

        // Fetch the updated acte details
        const updatedActe = await db('acte_dentaire')
            .where({ id_acte: acteId })
            .first();

        return updatedActe;
    } catch (error) {
        console.error('Database update error:', error);
        throw error;
    }
}

async function updateActeById(acteId, patientId, dentistId, dent, nomActe) {
    const isActive = await isActeActive(acteId, patientId, dentistId);
    if (!isActive) {
        throw new Error('acte is deleted');
    }

    try {
        // Check if the acteNom exists in acte_predefinis
        const actepre = await db('acte_dentaire_predefinis')
            .where('nom_acte', nomActe) // Use correct column name
            .first();
    
        if (!actepre) {
            throw new Error('acte does not exist in predefined list');
        }

        const prix_Acte = actepre.prix;

        // Perform the update operation
        const affectedRows = await db('acte_dentaire')
            .where({ id_acte: acteId, id_patient: patientId, id_dentiste: dentistId }) // Filter by both patientId and dentistId
            .update({
                dent: dent,
                nom_acte: nomActe,
                updated_at: new Date(),
            });

        // Check if any rows were affected
        if (affectedRows === 0) {
            throw new Error('acte not found or no changes made');
        }

        // Fetch the updated acte details
        const updatedActe = await db('acte_dentaire')
            .where({ id_acte: acteId })
            .first();

        return { updatedActe, prix_Acte };
    } catch (error) {
        console.error('Database update error:', error);
        throw error;
    }
}


async function updateActeStateById(acteId, patientId, dentistId, state) {
    const isActive = await isActeActive(acteId, patientId, dentistId);
    if (!isActive) {
        throw new Error('acte is already deleted');
    }
    try {
        // Perform the update operation
        const affectedRows = await db('acte_dentaire')
            .where({ id_acte: acteId, id_patient: patientId, id_dentiste: dentistId }) 
            .update({
                etat: state,
                updated_at: new Date(),
            });

        // Check if any rows were affected
        if (affectedRows === 0) {
            throw new Error('acte not found or no changes made');
        }

        // Fetch the updated acte details
        const updatedActe = await db('acte_dentaire')
            .where({ id_acte: acteId })
            .first();

        return updatedActe;
    } catch (error) {
        console.error('Database update error:', error);
        throw error;
    }
}

async function isActeActive(acteId, patientId, dentistId) {
    try {
        // Query the database for the acte with the given IDs
        const acte = await db('acte_dentaire')
            .select('deleted_at') // Select only the 'deleted_at' column
            .where({ id_acte: acteId, id_patient: patientId, id_dentiste: dentistId })
            .first(); // Fetch the first matching record

        if (!acte) {
            throw new Error('acte not found');
        }

        // Check if 'deleted_at' is NULL
        const isActive = acte.deleted_at === null;

        return isActive;
    } catch (error) {
        console.error('Error checking if acte is active:', error);
        throw error;
    }
}

async function getRecetteARecevoirByDate(dentistId, date) {
    try {
        // Format the date for comparison
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Query to sum all the prix values for the given date and dentist
        const result = await db('acte_dentaire')
            .join('acte_dentaire_predefinis', 'acte_dentaire.nom_acte', '=', 'acte_dentaire_predefinis.nom_acte')
            .whereRaw('DATE(acte_dentaire.created_at) = ?', [formattedDate])
            .andWhere('acte_dentaire.id_dentiste', dentistId)
            .sum('acte_dentaire_predefinis.prix as total_prix');

        // Extract the total_prix value from the result
        const totalPrix = result[0].total_prix || 0;

        return totalPrix;
    } catch (error) {
        console.error('Error fetching actes:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
}

module.exports = {
    getFicheDeSoinByPatient,
    getActeById,
    addActe,
    softDeleteActeById,
    updateActeById,
    updateActeStateById,
    isActeActive,
    getRecetteARecevoirByDate
};
