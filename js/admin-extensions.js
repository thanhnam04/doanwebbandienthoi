// Thêm vào admin.js - chức năng in hóa đơn
function printInvoice(orderId) {
    const token = localStorage.getItem('userToken'); // SỬA: userToken
    
    fetch(`http://localhost:3001/api/invoice/orders/${orderId}/invoice`, { // SỬA: 3001
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(r => r.text())
    .then(html => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(html);
        newWindow.document.close();
    })
    .catch(err => {
        console.log('❌ Error:', err);
        alert('Lỗi khi in hóa đơn!');
    });
}

// Thêm vào admin.js - filter đơn hàng theo ngày
function filterOrdersByDate() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    let url = 'http://localhost:3000/api/admin/orders';
    const params = new URLSearchParams();
    
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    const token = localStorage.getItem('token');
    
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(orders => {
        displayFilteredOrders(orders);
    })
    .catch(error => {
        console.error('Error filtering orders:', error);
        alert('Lỗi khi lọc đơn hàng!');
    });
}

function displayFilteredOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    let html = `
        <div class="filter-section" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
            <h4>Lọc đơn hàng theo ngày:</h4>
            <div style="display: flex; gap: 15px; align-items: center;">
                <div>
                    <label>Từ ngày:</label>
                    <input type="date" id="fromDate" style="margin-left: 5px;">
                </div>
                <div>
                    <label>Đến ngày:</label>
                    <input type="date" id="toDate" style="margin-left: 5px;">
                </div>
                <button onclick="filterOrdersByDate()" class="btn btn-primary">Lọc</button>
                <button onclick="loadAllOrders()" class="btn btn-secondary">Tất cả</button>
            </div>
        </div>
        <div class="orders-list">
    `;
    
    if (orders.length === 0) {
        html += '<p>Không có đơn hàng nào trong khoảng thời gian này.</p>';
    } else {
        orders.forEach(order => {
            html += `
                <div class="order-card" style="border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 5px;">
                    <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h5>Đơn hàng #${order.id}</h5>
                        <div>
                            <button onclick="printInvoice(${order.id})" class="btn btn-info btn-sm" style="margin-right: 5px;">
                                📄 In hóa đơn
                            </button>
                            <button onclick="approveOrder(${order.id})" class="btn btn-success btn-sm" style="margin-right: 5px;">
                                ✅ Duyệt
                            </button>
                            <button onclick="cancelOrder(${order.id})" class="btn btn-danger btn-sm">
                                ❌ Hủy
                            </button>
                        </div>
                    </div>
                    <div class="order-info">
                        <p><strong>Khách hàng:</strong> ${order.fullname}</p>
                        <p><strong>Điện thoại:</strong> ${order.phone}</p>
                        <p><strong>Tổng tiền:</strong> ${formatPrice(order.total_amount)}</p>
                        <p><strong>Trạng thái:</strong> <span class="status-${order.status}">${order.status}</span></p>
                        <p><strong>Ngày đặt:</strong> ${new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    ordersContainer.innerHTML = html;
}

// Thêm chức năng duyệt và hủy đơn hàng với quản lý kho
function approveOrder(orderId) {
    if (!confirm('Bạn có chắc muốn duyệt đơn hàng này? Số lượng sản phẩm trong kho sẽ bị giảm.')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/api/inventory/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Lỗi: ' + data.error);
        } else {
            alert('Đơn hàng đã được duyệt và kho hàng đã được cập nhật!');
            loadAllOrders(); // Reload orders
        }
    })
    .catch(error => {
        console.error('Error approving order:', error);
        alert('Lỗi khi duyệt đơn hàng!');
    });
}

function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/api/inventory/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Lỗi: ' + data.error);
        } else {
            alert('Đơn hàng đã được hủy!');
            if (data.stockRestored && data.stockRestored.length > 0) {
                alert('Kho hàng đã được hoàn trả!');
            }
            loadAllOrders(); // Reload orders
        }
    })
    .catch(error => {
        console.error('Error cancelling order:', error);
        alert('Lỗi khi hủy đơn hàng!');
    });
}

function loadAllOrders() {
    // Reset date filters
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    
    // Load all orders without date filter
    filterOrdersByDate();
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}