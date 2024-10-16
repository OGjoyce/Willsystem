// components/CityAutocomplete.jsx

import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';
import { Form } from 'react-bootstrap';

const CityAutocomplete = ({ onCitySelect, validationErrors }) => {
    const [province, setProvince] = useState('');
    const [country, setCountry] = useState('');

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
    }, 500); // Adjust debounce delay as needed

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
            // In the menu (dropdown), display full label
            return option.label;
        } else {
            // In the single-value (input), display only city name
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
                    placeholder="Type to search for a city..."
                    formatOptionLabel={formatOptionLabel}
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
