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
        showModifyAddressModal(
        );
    });

    // Add event listener to handle modify image button clicks
    $('#user-table tbody').on('click', 'button.modify-image-button', function () {
        const userID = this.id.split('_')[2];
        showModifyImageModal(userID);
    });

    // Add event listener to close the modal
    document.getElementById('modify-address-modal')
        .querySelector('.close')
        .addEventListener('click', function () {
            closeModal('modify-address-modal');
        }
        );

    document.getElementById('modify-address-modal')
        .querySelector('.cancel-button')
        .addEventListener('click', function () {
            closeModal('modify-address-modal');
        }
        );

    document.getElementById('modify-image-modal')
        .querySelector('.close')
        .addEventListener('click', function () {
            closeModal('modify-image-modal');
        }
        );

    document.getElementById('modify-image-modal')
        .querySelector('.cancel-button')
        .addEventListener('click', function () {
            closeModal('modify-image-modal');
        }
        );

    // Close modal when clicking outside of the modal content
    window.onclick = function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target == modal) {
                closeModal(modal.id);
            }
        });
    }

    document.getElementById('modifyAddressForm').addEventListener('submit', function (event) {
        event.preventDefault();
        submitModifyAddressForm();
    });

    document.getElementById('modify-image-form').addEventListener('submit', function (event) {
        event.preventDefault();
        submitModifyImageForm();
    });

    document.getElementById('image-file').addEventListener('change', function () {
        const file = this.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            document.getElementById('image-preview').src = reader.result;
        };
        reader.readAsDataURL(file);
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
                    `
                    <div class="action-button-container">
                        <button id="user_id_${user.user_id}" class="modify-address-button"><img src="images/edit.svg"></button>
                        <button id="user_id_${user.user_id}" class="modify-image-button"><img src="images/image.svg"></button>
                    </div>
                    `
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
            document.getElementById('address-userID').value = userID;
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


function closeModal(modal_id) {
    const modal = document.getElementById(modal_id);
    const modalContent = document.getElementById(`${modal_id}-content`);

    modal.classList.remove('show');
    modalContent.classList.remove('show');

    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

async function submitModifyAddressForm() {
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

function showModifyImageModal(userID) {
    const modal = document.getElementById('modify-image-modal');
    const modalContent = document.getElementById('modify-image-modal-content');

    document.getElementById('image-userID').value = userID;

    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        modalContent.classList.add('show');
    }, 10);
}

function submitModifyImageForm() {
    const fileInput = document.getElementById('image-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image');
        return;
    }

    const formData = new FormData(document.getElementById('modify-image-form'));
    const userID = formData.get('userID');
    if (!userID) {
        alert('User ID is missing');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Image = e.target.result;

        fetch(`/api/images/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('User updated successfully!');
                    closeModal('modify-image-modal');
                    populateUserTable();
                } else {
                    alert(`Failed to update user: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update user');
            });
    };
    reader.readAsDataURL(file);
}