if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    $('#admin-table').DataTable({
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
    populateAdminTable();

    // Add event listener to handle verify tenant button clicks
    $('#admin-table tbody').on('click', 'button.verify-tenant-button', function () {
        const userID = this.id.split('_')[2];
        window.location.href=`user.html?user_id=${userID}`;
    });
}

function populateAdminTable() {
    fetch ('/api/admin')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Failed to fetch admins:', data.message);
                return;
            }
            const users = data.users;
            const table = $('#admin-table').DataTable();
            table.clear();
            users.forEach(user => {
                let statusChip = "";
                if (user.status === 'verified') {
                    statusChip = '<span class="chip green">Verified</span>';
                } else if (user.status === 'suspicious') {
                    statusChip = '<span class="chip orange">Attention</span>';
                } else {
                    statusChip = '<span class="chip red">Unverified</span>';
                }
                table.row.add([
                    user.name, 
                    user.address, 
                    statusChip,
                    user.created_at, 
                    `
                    <div class="action-button-container">
                        <button id="user_id_${user.id}" class="verify-tenant-button"><img src="images/image.svg"></button>
                    </div>
                    `
                ]);
            });
            table.draw();
        })
        .catch(error => console.error('Error fetching admins:', error));
}