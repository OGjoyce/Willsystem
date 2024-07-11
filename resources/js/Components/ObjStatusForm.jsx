// resources/js/components/ObjStatusForm.jsx

import React, { useState } from 'react';
import axios from 'axios';

export async function storeDataObject(object){
    try {
        const response = await axios.post('/api/obj-statuses', {
            information: JSON.stringify({ data: object }), // Convert to JSON string
            related_id: 0,
            type: "",
        });
        console.log('Data submitted successfully:', response.data);
    
        // Optionally reset form
        return response.data;

    } catch (err) {
        console.error('Error submitting data:', err);
      
    }

}
export async function updateDataObject(object, id ){
    try {
        const response = await axios.put(`/api/obj-statuses/${id}`, {
            information: JSON.stringify({ data: object }), // Convert to JSON string
            related_id: 1,
            type: "",
        });
        console.log('Data submitted successfully:', response.data);
        // Optionally reset form
    } catch (err) {
        console.error('Error submitting data:', err);

    }

}

const ObjStatusForm = () => {
    const [information, setInformation] = useState('');
    const [relatedId, setRelatedId] = useState('');
    const [type, setType] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/obj-statuses', {
                information: JSON.stringify({ data: information }), // Convert to JSON string
                related_id: relatedId,
                type: type,
            });
            console.log('Data submitted successfully:', response.data);
            // Optionally reset form
            setInformation('');
            setRelatedId('');
            setType('');
        } catch (err) {
            console.error('Error submitting data:', err);
            setError('Error submitting data');
        }
    };
let anyobject = {
    "updated": "hello",
    "otro": "another"
};
let idcualquiera = 1;
    const handleUpdate = async (e) =>{
        e.preventDefault();
        try {
            const response = await axios.put(`/api/obj-statuses/${idcualquiera}`, {
                information: { data: anyobject }, // Convert to JSON string
                related_id: idcualquiera,
                type: type,
            });
            console.log('Data submitted successfully:', response.data);
            // Optionally reset form
            setInformation('');
            setRelatedId('');
            setType('');
        } catch (err) {
            console.error('Error submitting data:', err);
            setError('Error submitting data');
        }

    }

    return (
        <><div>
            <h1>Create ObjStatus</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="information">Information:</label>
                    <input
                        type="text"
                        id="information"
                        value={information}
                        onChange={(e) => setInformation(e.target.value)}
                        required />
                </div>
                <div>
                    <label htmlFor="relatedId">Related ID:</label>
                    <input
                        type="number"
                        id="relatedId"
                        value={relatedId}
                        onChange={(e) => setRelatedId(e.target.value)}
                        required />
                </div>

                <button type="submit">Submit</button>
            </form>
        </div><button onClick={handleUpdate}>Update shit</button></>
    );
};

export default ObjStatusForm;
