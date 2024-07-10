import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ObjStatusForm from '@/Components/ObjStatusForm';
const View = () => {
    const [objStatuses, setObjStatuses] = useState([]);

    useEffect(() => {
        axios.get('/api/obj-statuses')
            .then(response => {
                setObjStatuses(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    return (
        <><div>
            <h1>ObjStatus List</h1>
            <ul>
                {objStatuses.map(objStatus => (
                    <li key={objStatus.id}>{JSON.stringify(objStatus.information)}</li>
                ))}
            </ul>
        </div>
        <br></br>
        <br></br>
        <ObjStatusForm /></>
    );
};

export default View;