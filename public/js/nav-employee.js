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

    // Add event listener to handle modify employee button clicks
    $('#employee-table tbody').on('click', 'button.modify-employee-button', function () {
        const userID = this.id.split('_')[2];
        showModifyEmployeeModal(userID);
    });

    // Add event listener to close the modal
    document.getElementById('add-employee-modal')
        .querySelector('.close')
        .addEventListener('click', function () {
            closeModal('add-employee-modal');
        }
    );

    document.getElementById('modify-employee-modal')
        .querySelector('.close')
        .addEventListener('click', function () {
            closeModal('modify-employee-modal');
        }
    );

    document.getElementById('add-employee-modal')
        .querySelector('.cancel-button')
        .addEventListener('click', function () {
            closeModal('add-employee-modal');
        }
    );

    document.getElementById('modify-employee-modal')
        .querySelector('.cancel-button')
        .addEventListener('click', function () {
            closeModal('modify-employee-modal');
        }
    );

    window.onclick = function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    };

    document.getElementById('add-employee-form').addEventListener('submit', function (event) {
        event.preventDefault();
        addEmployee();
    });

    document.getElementById('modify-employee-form').addEventListener('submit', function (event) {
        event.preventDefault();
        modifyEmployee();
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
                    `<button id="user_id_${employee.user_id}" class="modify-employee-button"><img src="images/edit.svg"></button>`
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

function showModifyEmployeeModal(userID) {
    const modal = document.getElementById('modify-employee-modal');
    const modalContent = document.getElementById('modify-employee-modal-content');

    document.getElementById('modify-userID').value = userID;

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        modalContent.classList.add('show');
    }, 10);
}

function closeModal(modal_id) {
    const modal = document.getElementById(modal_id);
    const modalContent = document.getElementById(`${modal_id}-content`);

    modal.classList.remove('show');
    modalContent.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

async function addEmployee() {
    const name = document.getElementById('add-name').value;
    const email = document.getElementById('add-email').value;
    const ic = document.getElementById('add-ic').value;
    const password = document.getElementById('add-password').value;
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
            closeModals();
            populateEmployeeTable();
        } else {
            console.error('Failed to add employee:', data.message);
        }
    } catch (error) {
        console.error('Error adding employee:', error);
    }
}

async function modifyEmployee() {
    const userID = document.getElementById('modify-userID').value;
    const password = document.getElementById('modify-password').value;

    try {
        const response = await fetch(`/api/employees/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        const data = await response.json();

        if (data.success) {
            closeModal('modify-employee-modal');
            populateEmployeeTable();
        } else {
            console.error('Failed to modify employee:', data.message);
        }
    } catch (error) {
        console.error('Error modifying employee:', error);
    }
}