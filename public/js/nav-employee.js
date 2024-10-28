if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    $('#employee-table').DataTable({
        layout: {
            topStart: 'info',
            bottom: 'paging',
            bottomStart: null,
            bottomEnd: null
        },
        paging: true,
        info: true,
        // pageResize: true
    });
    populateEmployeeTable();

    // Add event listener to handle modify address button clicks
    $('#employee-table tbody').on('click', 'button.delete-employee-button', function () {
        const userID = this.id.split('_')[2];
    });
}

function populateEmployeeTable() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to fetch employees:', data.message);
                return;
            }
            const employees = data.employees;
            const table = $('#employee-table').DataTable();
            table.clear();
            employees.forEach(employee => {
                table.row.add([
                    employee.name,
                    employee.role.charAt(0).toUpperCase() + employee.role.slice(1),
                    employee.email,
                    employee.last_activity,
                    `<button id="user_id_${employee.user_id}" class="delete-employee-button"><img src="images/edit.svg"></button>`
                ]);
            });
            table.draw();
        })
        .catch(error => console.error('Error fetching employees:', error));
}