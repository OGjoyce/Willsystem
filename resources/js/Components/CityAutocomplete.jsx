// components/CityAutocomplete.jsx

import React from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';

const CityAutocomplete = ({ onCitySelect }) => {
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
        <AsyncSelect
            cacheOptions
            loadOptions={loadCityOptions}
            defaultOptions
            onChange={onCitySelect}
            placeholder="Type to search for a city..."
            formatOptionLabel={formatOptionLabel}
        />
    );
};

export default CityAutocomplete;
