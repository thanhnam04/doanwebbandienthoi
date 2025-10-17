var currentUser;
var tongTienTatCaDonHang = 0; // lưu tổng tiền từ tất cả các đơn hàng đã mua
var tongSanPhamTatCaDonHang = 0;

window.onload = async function () {
    khoiTao();
    
    // Load products from API
    window.list_products = await ProductsAPI.getAll();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // thêm tags (từ khóa) vào khung tìm kiếm
    var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
    for (var t of tags) addTags(t, "index.html?search=" + t);

    currentUser = getCurrentUser();

    if (currentUser) {
        // Load user profile from API
        try {
            const userProfile = await AuthAPI.getProfile(currentUser.user.id);
            if (!userProfile.error) {
                // Merge API data with current user
                currentUser.user = { ...currentUser.user, ...userProfile };
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
        
        await addTatCaDonHang(currentUser);
        addInfoUser(currentUser);
    } else {
        var warning = `<h2 style="color: red; font-weight:bold; text-align:center; font-size: 2em; padding: 50px;">
                            Bạn chưa đăng nhập !!
                        </h2>`;
        document.getElementsByClassName('infoUser')[0].innerHTML = warning;
    }
}

// Phần Thông tin người dùng
function addInfoUser(user) {
    if (!user) return;
    document.getElementsByClassName('infoUser')[0].innerHTML = `
    <hr>
    <table>
        <tr>
            <th colspan="3">THÔNG TIN KHÁCH HÀNG</th>
        </tr>
        <tr>
            <td>Tài khoản: </td>
            <td> <input type="text" value="` + (user.user.username || user.username) + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'username')"></i> </td>
        </tr>
        <tr>
            <td>Mật khẩu: </td>
            <td style="text-align: center;"> 
                <i class="fa fa-pencil" id="butDoiMatKhau" onclick="openChangePass()"> Đổi mật khẩu</i> 
            </td>
            <td></td>
        </tr>
        <tr>
            <td colspan="3" id="khungDoiMatKhau">
                <table>
                    <tr>
                        <td> <div>Mật khẩu cũ:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>Mật khẩu mới:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>Xác nhận mật khẩu:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td> 
                            <div><button onclick="changePass()">Đồng ý</button></div> 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>Họ tên: </td>
            <td> <input type="text" value="` + (user.user.fullname || user.fullname || '') + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'fullname')"></i> </td>
        </tr>
        <tr>
            <td>Email: </td>
            <td> <input type="text" value="` + (user.user.email || user.email || '') + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'email')"></i> </td>
        </tr>
        <tr>
            <td>Số điện thoại: </td>
            <td> <input type="text" value="` + (user.user.phone || user.phone || '') + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'phone')"></i> </td>
        </tr>
        <tr>
            <td colspan="3" style="padding:5px; border-top: 2px solid #ccc;"></td>
        </tr>
        <tr>
            <td>Tổng tiền đã mua: </td>
            <td> <input type="text" value="` + numToString(tongTienTatCaDonHang) + `₫" readonly> </td>
            <td></td>
        </tr>
        <tr>
            <td>Số lượng sản phẩm đã mua: </td>
            <td> <input type="text" value="` + tongSanPhamTatCaDonHang + `" readonly> </td>
            <td></td>
        </tr>
    </table>`;
}

function openChangePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var actived = khungChangePass.classList.contains('active');
    if (actived) khungChangePass.classList.remove('active');
    else khungChangePass.classList.add('active');
}

function changePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var inps = khungChangePass.getElementsByTagName('input');
    if (inps[0].value != currentUser.pass) {
        alert('Sai mật khẩu !!');
        inps[0].focus();
        return;
    }
    if (inps[1] == '') {
        inps[1].focus();
        alert('Chưa nhập mật khẩu mới !');
    }
    if (inps[1].value != inps[2].value) {
        alert('Mật khẩu không khớp');
        inps[2].focus();
        return;
    }

    // Update password via API
    AuthAPI.updateProfile(currentUser.user.id, { password: inps[1].value })
        .then(result => {
            if (result.error) {
                alert('Lỗi cập nhật mật khẩu!');
                return;
            }
            
            currentUser.pass = inps[1].value;
            setCurrentUser(currentUser);
            
            // Cập nhật trên header
            capNhat_ThongTin_CurrentUser();
            
            // thông báo
            addAlertBox('Thay đổi mật khẩu thành công.', '#5f5', '#000', 4000);
            openChangePass();
        })
        .catch(error => {
            console.error('Error updating password:', error);
            alert('Lỗi cập nhật mật khẩu!');
        });
}

function changeInfo(iTag, info) {
    var inp = iTag.parentElement.previousElementSibling.getElementsByTagName('input')[0];

    // Đang hiện
    if (!inp.readOnly && inp.value != '') {

        // Update user info directly via API
        currentUser.user[info] = inp.value;
        
        // Update profile via API
        const updateData = {};
        updateData[info] = inp.value;
        
        AuthAPI.updateProfile(currentUser.user.id, updateData)
            .then(result => {
                if (result.error) {
                    alert('Lỗi cập nhật thông tin!');
                    return;
                }
                
                // Update local session
                setCurrentUser(currentUser);
        
                // Cập nhật trên header
                capNhat_ThongTin_CurrentUser();
                
                addAlertBox('Cập nhật thông tin thành công!', '#5f5', '#000', 3000);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Lỗi cập nhật thông tin!');
            });

        iTag.innerHTML = '';

    } else {
        iTag.innerHTML = 'Đồng ý';
        inp.focus();
        var v = inp.value;
        inp.value = '';
        inp.value = v;
    }

    inp.readOnly = !inp.readOnly;
}


async function addTatCaDonHang(user) {
    if (!user) {
        document.getElementsByClassName('listDonHang')[0].innerHTML = `
            <h3 style="width=100%; padding: 50px; color: red; font-size: 2em; text-align: center"> 
                Bạn chưa đăng nhập !!
            </h3>`;
        return;
    }
    
    // Get orders from API
    const orders = await OrdersAPI.getUserOrders(user.user.id);
    
    if (!orders.length) {
        document.getElementsByClassName('listDonHang')[0].innerHTML = `
            <h3 style="width=100%; padding: 50px; color: green; font-size: 2em; text-align: center"> 
                Xin chào ` + user.user.username + `. Bạn chưa có đơn hàng nào.
            </h3>`;
        return;
    }
    
    for (var order of orders) {
        addDonHang(order);
    }
}

function addDonHang(order) {
    var div = document.getElementsByClassName('listDonHang')[0];

    var s = `
            <table class="listSanPham">
                <tr> 
                    <th colspan="6">
                        <h3 style="text-align:center;"> Đơn hàng ngày: ` + new Date(order.created_at).toLocaleString() + `</h3> 
                    </th>
                </tr>
                <tr>
                    <th>STT</th>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Trạng thái</th> 
                </tr>`;

    if (order.items) {
        var items = order.items.split(',');
        for (var i = 0; i < items.length; i++) {
            var itemData = items[i].split(':');
            var masp = itemData[0];
            var quantity = parseInt(itemData[1]);
            var price = itemData[2];
            
            var p = timKiemTheoMa(list_products, masp);
            if (!p) continue;
            
            var thanhtien = stringToNum(price) * quantity;

            s += `
                    <tr>
                        <td>` + (i + 1) + `</td>
                        <td class="noPadding imgHide">
                            <a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
                                ` + p.name + `
                                <img src="` + p.img + `">
                            </a>
                        </td>
                        <td class="alignRight">` + price + ` ₫</td>
                        <td class="soluong">` + quantity + `</td>
                        <td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
                        <td style="text-align: center">` + order.status + `</td>
                    </tr>
                `;
            tongSanPhamTatCaDonHang += quantity;
        }
    }
    
    tongTienTatCaDonHang += order.total_amount;

    s += `
                <tr style="font-weight:bold; text-align:center; height: 4em;">
                    <td colspan="4">TỔNG TIỀN: </td>
                    <td class="alignRight">` + numToString(order.total_amount) + ` ₫</td>
                    <td>` + order.status + `</td>
                </tr>
            </table>
            <hr>
        `;
    div.innerHTML += s;
}