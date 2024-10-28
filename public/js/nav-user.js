if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    $('#user-table').DataTable({
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
    populateUserTable();

    // Add event listener to handle modify address button clicks
    $('#user-table tbody').on('click', 'button.modify-address-button', function () {
        const userID = this.id.split('_')[2];
        showModifyAddressModal(userID);
    });

    // Add event listener to close the modal
    document.querySelector('.modal .close').addEventListener('click', function () {
        closeModifyAddressModal();
    });

    document.querySelector('.cancel-button').addEventListener('click', function () {
        closeModifyAddressModal();
    });

    // Close modal when clicking outside of the modal content
    window.onclick = function (event) {
        const modal = document.getElementById('modify-address-modal');
        if (event.target == modal) {
            closeModifyAddressModal();
        }
    };

    document.getElementById('modifyAddressForm').addEventListener('submit', function (event) {
        event.preventDefault(); 
        submitForm(); 
    });
}

function populateUserTable() {
    fetch('/api/users')
    .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to fetch users:', data.message);
                return;
            }
            const users = data.users;
            const table = $('#user-table').DataTable();
            table.clear();
            users.forEach(user => {
                table.row.add([
                    user.user_name,
                    user.user_email,
                    user.user_ic,
                    user.address,
                    `<button id="user_id_${user.user_id}" class="modify-address-button"><img src="images/edit.svg"></button>`
                ]).draw();
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function showModifyAddressModal(userID) {
    fetch(`/user/${userID}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to fetch user:', data.message);
                return;
            }
            const user = data.user;
            document.getElementById('userID').value = userID;
            document.getElementById('name').value = user.user_name;
            document.getElementById('email').value = user.user_email;
            document.getElementById('address').value = user.address_line;
            document.getElementById('city').value = user.city;
            document.getElementById('state').value = user.state;
            document.getElementById('zipcode').value = user.zipcode;

            const modal = document.getElementById('modify-address-modal');
            const modalContent = document.querySelector('.modal-content');

            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('show');
                modalContent.classList.add('show');
            }, 10); 
        })
        .catch(error => console.error('Error fetching user:', error));
}


function closeModifyAddressModal() {
    const modal = document.getElementById('modify-address-modal');
    const modalContent = document.querySelector('.modal-content');

    modal.classList.remove('show');
    modalContent.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

async function submitForm() {
    const formData = new FormData(document.getElementById('modifyAddressForm'));

    if (!formData.get('address') || !formData.get('city') || !formData.get('state') || !formData.get('zipcode')) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/update-address', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('User updated successfully!');
            closeModifyAddressModal();
            populateUserTable();
        } else {
            alert(`Failed to update user: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update user');
    }
}