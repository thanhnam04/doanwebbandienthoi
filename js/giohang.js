var currentuser;
var cartItems = [];

window.onload = async function () {
    khoiTao();
    
    // Load products from API
    window.list_products = await ProductsAPI.getAll();

	// autocomplete cho khung tim kiem
	autocomplete(document.getElementById('search-box'), list_products);

	// thêm tags (từ khóa) vào khung tìm kiếm
	var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
	for (var t of tags) addTags(t, "index.html?search=" + t)

	currentuser = getCurrentUser();
	await loadCartFromAPI();
	addProductToTable();
}

async function loadCartFromAPI() {
    if (currentuser && currentuser.user) {
        cartItems = await CartAPI.get(currentuser.user.id);
    }
}

function addProductToTable() {
	var table = document.getElementsByClassName('listSanPham')[0];

	var s = `
		<tbody>
			<tr>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

	if (!currentuser) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Bạn chưa đăng nhập !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	} else if (cartItems.length == 0) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Giỏ hàng trống !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	}

	var totalPrice = 0;
	for (var i = 0; i < cartItems.length; i++) {
		var item = cartItems[i];
		var p = timKiemTheoMa(list_products, item.masp);
		if (!p) continue;
		
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thanhtien = stringToNum(price) * item.quantity;

		s += `
			<tr>
				<td>` + (i + 1) + `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
						` + item.name + `
						<img src="` + item.img + `">
					</a>
				</td>
				<td class="alignRight">` + item.price + ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` + item.masp + `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` + item.masp + `')" value=` + item.quantity + `>
					<button onclick="tangSoLuong('` + item.masp + `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
				<td style="text-align: center" >-</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang('` + item.masp + `')"></i> </td>
			</tr>
		`;
		totalPrice += thanhtien;
	}

	s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN: </td>
				<td class="alignRight">` + numToString(totalPrice) + ` ₫</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>
	`;

	table.innerHTML = s;
}

async function xoaSanPhamTrongGioHang(masp) {
	if (window.confirm('Xác nhận hủy mua')) {
		await CartAPI.remove(currentuser.user.id, masp);
		await capNhatMoiThu();
	}
}

function thanhToan() {
	var c_user = getCurrentUser();
	if(c_user.off) {
        alert('Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!');
        addAlertBox('Tài khoản của bạn đã bị khóa bởi Admin.', '#aa0000', '#fff', 10000);
        return;
	}
	
	if (!currentuser.products.length) {
		addAlertBox('Không có mặt hàng nào cần thanh toán !!', '#ffb400', '#fff', 2000);
		return;
	}
	if (window.confirm('Thanh toán giỏ hàng ?')) {
		currentuser.donhang.push({
			"sp": currentuser.products,
			"ngaymua": new Date(),
			"tinhTrang": 'Đang chờ xử lý'
		});
		currentuser.products = [];
		capNhatMoiThu();
		addAlertBox('Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.', '#17c671', '#fff', 4000);
	}
}

function xoaHet() {
	if (currentuser.products.length) {
		if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!')) {
			currentuser.products = [];
			capNhatMoiThu();
		}
	}
}

// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong = soLuongMoi;
		}
	}

	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong++;
		}
	}

	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			if (p.soluong > 1) {
				p.soluong--;
			} else {
				return;
			}
		}
	}

	capNhatMoiThu();
}

function capNhatMoiThu() { // Mọi thứ
	animateCartNumber();

	// cập nhật danh sách sản phẩm trong localstorage
	setCurrentUser(currentuser);
	updateListUser(currentuser);

	// cập nhật danh sách sản phẩm ở table
	addProductToTable(currentuser);

	// Cập nhật trên header
	capNhat_ThongTin_CurrentUser();
}
