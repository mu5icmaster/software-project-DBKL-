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
        console.log('Modify address for user:', userID);
        showModifyAddressModal(userID);
    });

    document.querySelector('.modal .close').addEventListener('click', function () {
        document.getElementById('modify-address-modal').style.display = 'none';
    });
}

function populateUserTable() {
    fetch('/users')
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
                    user.user_id,
                    `<button id="user_id_${user.user_id}" class="modify-address-button"><img src="images/edit.svg"></button>`
                ]).draw();
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

function showModifyAddressModal(userID) {
    document.getElementById('userID').value = userID;
    document.getElementById('modify-address-modal').style.display = 'block';
}


