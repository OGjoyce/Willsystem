// Function to save data to localStorage
export const saveData = (data) => {
    localStorage.setItem('fullData', JSON.stringify(data));
    console.log("Saved data:", JSON.parse(localStorage.getItem('fullData')));
};


// Function to export the current state to a JSON file
export function exportData() {
  const datos = localStorage.getItem('fullData');
  if (datos) {
    const blob = new Blob([datos], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form_data.json';
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert('No data saved on LocalStorage!')
  }
}

export const deleteData = () => {
    localStorage.removeItem('fullData');
    console.log("Data deleted from localStorage");
};

//PENDING:

// Function to import data from a JSON file
// Function to load data from localStorage
