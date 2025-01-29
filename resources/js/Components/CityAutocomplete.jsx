import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';
import { Form } from 'react-bootstrap';

const CityAutocomplete = ({ onCitySelect, validationErrors, formValues }) => {
    const [province, setProvince] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('')

    // Cargar valores iniciales desde formValues cuando cambien
    useEffect(() => {

        if (
            (formValues?.city !== city || formValues?.province !== province || formValues?.country !== country)) {
            setCity(formValues?.city || '');
            setProvince(formValues?.province || '');
            setCountry(formValues?.country || '');

            onCitySelect({
                city: formValues?.city,
                province: formValues?.province,
                country: formValues?.country,
            });
        }
    }, [formValues]); // Solo depende de formValues y onCitySelect

    const loadCityOptions = debounce((inputValue, callback) => {
        if (!inputValue) {
            return callback([]);
        }

        fetch(`/api/cities?q=${encodeURIComponent(inputValue)}`)
            .then((response) => response.json())
            .then((data) => {
                const options = data.map((city) => ({
                    value: city.id,
                    label: `${city.city_ascii}, ${city.admin_name}, ${city.country}`,
                    city: city.city_ascii,
                    province: city.admin_name,
                    country: city.country,
                }));
                callback(options);
            })
            .catch((error) => {
                console.error('Error fetching city data:', error);
                callback([]);
            });
    }, 500); // Ajusta el tiempo de debounce según sea necesario

    const handleChange = (selectedOption) => {
        if (selectedOption) {
            setProvince(selectedOption.province);
            setCountry(selectedOption.country);
            onCitySelect({
                city: selectedOption.city,
                province: selectedOption.province,
                country: selectedOption.country,
            });
        } else {
            setProvince('');
            setCountry('');
            onCitySelect({
                city: '',
                province: '',
                country: '',
            });
        }
    };

    const formatOptionLabel = (option, { context }) => {
        if (context === 'menu') {
            // En el menú (desplegable), muestra la etiqueta completa
            return option.label;
        } else {
            // En el valor único (input), muestra solo el nombre de la ciudad
            return option.city;
        }
    };

    return (
        <>
            <Form.Group className="mb-3" controlId="city">
                <Form.Label>City</Form.Label>
                <AsyncSelect
                    cacheOptions
                    loadOptions={loadCityOptions}
                    defaultOptions
                    onChange={handleChange}
                    placeholder={city || "Type to search for a city..."}
                    formatOptionLabel={formatOptionLabel}
                    value={city}
                />
            </Form.Group>
            {validationErrors.city && <p className="mt-2 text-sm text-red-600">{validationErrors.city}</p>}
            <Form.Group className="mt-3" controlId="province">
                <Form.Label>Province/State:</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="..."
                    value={province}
                />
                {validationErrors.province && (
                    <p className="mt-2 text-sm text-red-600">
                        {validationErrors.province}
                    </p>
                )}
            </Form.Group>
            <Form.Group className="mt-3" controlId="country">
                <Form.Label>Country:</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="..."
                    value={country}
                />
                {validationErrors.country && (
                    <p className="mt-2 text-sm text-red-600">
                        {validationErrors.country}
                    </p>
                )}
            </Form.Group>
        </>
    );
};

export default CityAutocomplete;
