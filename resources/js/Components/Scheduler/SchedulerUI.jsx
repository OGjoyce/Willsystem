import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';

export function SchedulerUI() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState({ title: '', description: '', date: '', time: '' });

  // Obtener tareas del backend al cargar el componente
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/appointments', {
          params: { user_id: 1, start_date: '2024-12-01', end_date: '2024-12-31' }, // Ajusta el rango según tus necesidades
        });
        setTasks(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/appointments', {
        user_id: 1, // Cambiar por el ID del usuario actual
        title: task.title,
        description: task.description,
        date: task.date,
        time: task.time,
        duration: 60, // Puedes permitir que el usuario elija la duración si lo necesitas
      });

      setTasks([...tasks, response.data]);
      setTask({ title: '', description: '', date: '', time: '' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/api/appointments/${id}`); // Asegúrate de definir esta ruta en el backend
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} className="mx-auto">
          <h2 className="text-center mb-4">Scheduler</h2>
          <Form onSubmit={handleAddTask}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                name="title"
                value={task.title}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                name="description"
                value={task.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={task.date}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={task.time}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button variant="outline-primary" type="submit" className="w-100">
              Add Task
            </Button>
          </Form>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h3>Scheduled Tasks</h3>
          {tasks.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{task.date}</td>
                    <td>{task.time}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No tasks scheduled.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default SchedulerUI;
