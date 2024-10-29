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
    });
    populateEmployeeTable();

    // Inject the "Add" button into the desired div
    const addButton = $('<button id="add-employee-button" class="add-button">Add</button>');
    addButton.on('click', function () {
        showAddEmployeeModal();
    });
    $('.dt-layout-cell.dt-layout-end').prepend(addButton);

    // Add event listener to close the modal
    document.querySelector('.modal .close').addEventListener('click', function () {
        closeAddEmployeeModal();
    });

    document.querySelector('.cancel-button').addEventListener('click', function () {
        closeAddEmployeeModal();
    });

    window.onclick = function (event) {
        const modal = document.getElementById('add-employee-modal');
        if (event.target == modal) {
            closeAddEmployeeModal();
        }
    };
    
    document.getElementById('add-employee-form').addEventListener('submit', function (event) {
        event.preventDefault();
        addEmployee();
    });

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

function showAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    const modalContent = document.getElementById('add-employee-modal-content');

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        modalContent.classList.add('show');
    }, 10);
}

function closeAddEmployeeModal() {
    const modal = document.getElementById('add-employee-modal');
    const modalContent = document.getElementById('add-employee-modal-content');

    modal.classList.remove('show');
    modalContent.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

async function addEmployee() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const ic = document.getElementById('ic').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, ic, password })
        });
        const data = await response.json();

        if (data.success) {
            closeAddEmployeeModal();
            populateEmployeeTable();
        } else {
            console.error('Failed to add employee:', data.message);
        }
    } catch (error) {
        console.error('Error adding employee:', error);
    }
}