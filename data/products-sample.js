var list_products = [
{
    "name": "SamSung Galaxy J4+",
    "company": "Samsung",
    "img": "img/products/samsung-galaxy-j4-plus-pink-400x400.jpg",
    "price": "3.490.000",
    "star": 3,
    "rateCount": 26,
    "stock": 25,
    "promo": {
        "name": "tragop",
        "value": "0"
    },
    "detail": {
        "screen": "IPS LCD, 6.0', HD+",
        "os": "Android 8.1 (Oreo)",
        "camara": "13 MP",
        "camaraFront": "5 MP",
        "cpu": "Qualcomm Snapdragon 425 4 nhân 64-bit",
        "ram": "2 GB",
        "rom": "16 GB",
        "microUSB": "MicroSD, hỗ trợ tối đa 256 GB",
        "battery": "3300 mAh"
    },
    "masp": "Sam0"
}, {
    "name": "Xiaomi Mi 8 Lite",
    "company": "Xiaomi",
    "img": "img/products/xiaomi-mi-8-lite-black-1-600x600.jpg",
    "price": "6.690.000",
    "star": 0,
    "rateCount": 0,
    "stock": 30,
    "promo": {
        "name": "tragop",
        "value": "0"
    },
    "detail": {
        "screen": "IPS LCD, 6.26', Full HD+",
        "os": "Android 8.1 (Oreo)",
        "camara": "12 MP và 5 MP (2 camera)",
        "camaraFront": "24 MP",
        "cpu": "Qualcomm Snapdragon 660 8 nhân",
        "ram": "4 GB",
        "rom": "64 GB",
        "microUSB": "MicroSD, hỗ trợ tối đa 512 GB",
        "battery": "3300 mAh, có sạc nhanh"
    },
    "masp": "Xia0"
}, {
    "name": "Oppo F9",
    "company": "Oppo",
    "img": "img/products/oppo-f9-red-600x600.jpg",
    "price": "7.690.000",
    "star": 5,
    "rateCount": 188,
    "stock": 45,
    "promo": {
        "name": "giamgia",
        "value": "500.000"
    },
    "detail": {
        "screen": "LTPS LCD, 6.3', Full HD+",
        "os": "ColorOS 5.2 (Android 8.1)",
        "camara": "16 MP và 2 MP (2 camera)",
        "camaraFront": "25 MP",
        "cpu": "MediaTek Helio P60 8 nhân 64-bit",
        "ram": "4 GB",
        "rom": "64 GB",
        "microUSB": "MicroSD, hỗ trợ tối đa 256 GB",
        "battery": "3500 mAh, có sạc nhanh"
    },
    "masp": "Opp0"
}, {
    "name": "iPhone 15 Pro Max 512GB",
    "company": "Apple",
    "img": "img/products/iphone-15-promax-512gb.jpg",
    "price": "39.990.000",
    "star": 5,
    "rateCount": 785,
    "stock": 15,
    "promo": {
        "name": "giareonline",
        "value": "37.990.000"
    },
    "detail": {
        "screen": "OLED, 6.7', Super Retina XDR, ProMotion 120Hz",
        "os": "iOS 17",
        "camara": "3 camera 48 MP",
        "camaraFront": "12 MP",
        "cpu": "Apple A17 Pro",
        "ram": "8 GB",
        "rom": "512 GB",
        "microUSB": "Không",
        "battery": "4422 mAh, có sạc nhanh"
    },
    "masp": "App37"
}];

// Export for Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = list_products;
}