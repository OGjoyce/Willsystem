import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const ChangeRequestForm = () => {
    const [requestedChanges, setRequestedChanges] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para enviar los cambios solicitados
        console.log('Cambios solicitados:', requestedChanges);
        // Limpiar el formulario después del envío
        setRequestedChanges('');
    };

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>Please submit your requested changes:</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="requestedChanges">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={requestedChanges}
                            onChange={(e) => setRequestedChanges(e.target.value)}
                            placeholder="Type..."
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ChangeRequestForm;