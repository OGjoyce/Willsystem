
    useEffect(() => {
        storeDataObject(object_status)
    })

    async function storeDataObject(object) {
        try {
            const response = await axios.post('https://willsystemapp.com/api/obj-statuses', {
                information: JSON.stringify(object), // Convert to JSON string
                related_id: 0,
                type: "",
            });
            console.log('Data submitted successfully:', response.data);

            return response.data;

        } catch (err) {
            console.error('Error submitting data:', err);

        }

    }