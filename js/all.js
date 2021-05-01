//初始化資料
let productList = [];
let cartsList = [];
//綁定dom元素
const Product = document.querySelector('.js-products');
const selectItem = document.querySelector('.js-selectItem');
const carts = document.querySelector('.js-carts');
const shoppingCart = document.querySelector('.js-shoppingCart');
const apiPath = "think";
const baseUrl = "https://hexschoollivejs.herokuapp.com";
//初始化網頁
function init() {
    getProductList();
    getCartsList();
}
init()
//取得產品列表
function getProductList() {
    const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/products`;
    axios.get(url).then(function (res) {
        productList = res.data.products;
        renderProductList()
    })
        .catch(function (err) { console.log(err); })
}
//渲染產品列表
function renderProductList() {
    let str = "";
    productList.forEach(function (item) {
        str += combineProductHTMLItem(item);
    })
    Product.innerHTML = str;
}
//重複字串，整理成函式
function combineProductHTMLItem(item) {
    return `<li class="col-6 col-md-4 col-lg-3 mb-4 position-relative">
    <div class="productTag bg-dark text-white py-2 px-4 position-absolute ">新品</div>
    <img
      src="${item.images}"
      class="productImg">
    <a href="#" class="btn btn-dark rounded-0 w-100 mb-2 " data-add="add"  data-id="${item.id}">加入購物車</a>
    <h4 class="font-size-sm h6-md mb-md-2 font-weight-bold">${item.title}</h4>
    <del class=" h5 font-weight-bold">NT$${toThousands(item.origin_price)}</del>
    <h4 class="font-weight-bold">NT$${toThousands(item.price)}</h4>
  </li>`
}
//產品篩選
selectItem.addEventListener('change', function (e) {
    let category = e.target.value;
    if (category === "全部") {
        renderProductList();
    } else {
        let str = '';
        productList.forEach(function (item) {
            if (category == item.category) {
                str += combineProductHTMLItem(item)
            }
            Product.innerHTML = str;
        })
    }
})
//取得購物車列表
function getCartsList() {

    const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
    axios.get(url).then(function (res) {
        renderCartsList(res);
    }).catch(function (err) { console.log(err); })
}
//渲染購物車列表
function renderCartsList(res) {
    let str = '';
    cartsList = res.data.carts;
    let total = toThousands(res.data.finalTotal);
    document.querySelector('.js-finalTotal').innerHTML = `$${total}`
    cartsList.forEach(function (item) {
        str += ` <li class="col-md-4 col-lg-5 d-flex flex-column flex-md-row align-items-md-center">
        <img width="80px" height="80px"  src="${item.product.images}" class="cartImg mb-2 mr-md-3">
        <h6 ><span class="d-md-none">品名：</span>${item.product.title}</h6>
    </li>
    <li class="col-md-2 col-lg-2">
        <h6 ><span class="d-md-none">單價：</span>NT$${toThousands(item.product.price)}</h6>
    </li>
    <li class="col-md-2 p-0 col-lg-2 h6 mb-0">
          <span class="d-md-none p0 ">數量：</span>
      ${item.quantity === 1 ? `<span class="pl0 material-icons remove material-icons btn text-secondary h5 pl-0 pt-2 disabled"  data-id="${item.id}">remove</span>
` : `<span class="pl0 material-icons remove material-icons btn text-secondary h5 pl-0 pt-2" data-id="${item.id}">remove</span>`}
      <input class="wid border-0" type="text" id="${item.id}" value="${item.quantity}" > 
      <span class="material-icons add material-icons btn text-secondary h5 pl-0 pt-2" data-id="${item.id}">add</span>
          </li>
    <li class="col-10 col-md-2 col-lg-2 d-flex align-items-center justify-content-between">
        <h6 class="h6"><span class="d-md-none">金額：</span>NT$${toThousands(item.quantity * item.product.price)}</h6>
    </li>
    <li class="col-2 col-md-1 col-lg-1 d-flex align-items-center justify-content-between">        
      <a href="#" class=" nav-link material-icons text-dark" data-del="delete" data-id="${item.id}">
          close
      </a>
  </li>`
    })
    carts.innerHTML = str;
    const remove = document.querySelectorAll('.remove');
    remove.forEach(function (item) {
        item.addEventListener('click', function (e) {
            let id = e.target.dataset.id;
            changeCartsNum("remove", id);
        })
    })
    const add = document.querySelectorAll('.add');
    add.forEach(function (item) {
        item.addEventListener('click', function (e) {
            let id = e.target.dataset.id;
            changeCartsNum("add", id);
        })
    })
}
//購物車內數量 加和減
function changeCartsNum(status, id) {
    let num = Number(document.querySelector(`[id="${id}"]`).value)
    if (status == "remove") {
        if (num === 1) {
            Swal.fire(
                '數量不可小於1',
                '',
                'error'
            )
            return
        }
        num -= 1;
    } else {
        num += 1;
    }
    let newData = {
        "data": {
            "id": id,
            "quantity": num
        }
    }
    const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
    axios.patch(url, newData).then(function (res) {
        Swal.fire(
            '修改成功',
            '',
            'success')
        renderCartsList(res);
    }).catch(function (err) { console.log(err); })
}
//加入購物車
Product.addEventListener('click', function (e) {
    e.preventDefault();
    let productId = e.target.dataset.id;
    let num = 1;
    cartsList.forEach(function (item) {
        if (productId === item.product.id) {
            num = item.quantity += 1;
        }
    })
    let NewData = {
        "data": {
            "productId": productId,
            "quantity": num
        }
    }
    if (e.target.dataset.add === "add") {
        const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
        axios.post(url, NewData).then(function (res) {
            Swal.fire(
                '已加入購物車',
                '',
                'success')
            renderCartsList(res)
        }).catch(function (err) { console.log(err); })
    }
})
//刪除全部品項和單一品項刪除
shoppingCart.addEventListener('click', function (e) {
    e.preventDefault();
    let productID = e.target.dataset.id;
    let url = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apI_pah}/carts/${productID}`
    //全部刪除
    if (e.target.getAttribute('class') == "js-deleteCartAll btn btn-outline-primary text-nowrap") {
        if (cartsList.length === 0) {
            Swal.fire(
                '目前購物車沒有商品',
                '',
                'error'
            )
            return
        }
        axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apI_pah}/carts/`).then(function (res) {
            Swal.fire(
                '購物車已全部清空',
                '',
                'success'
            )
            renderCartsList(res);
        }).catch(function (err) { console.log(err); })
    }
    //單一品項刪除
    if (e.target.dataset.del == "delete") {
        if (cartsList.length === 0) {
            alert('購物車沒有商品')
            return
        }
        axios.delete(url).then(function (res) {
            Swal.fire(
                '單筆品項刪除成功',
                '',
                'success'
            )
            renderCartsList(res);
        }).catch(function (err) { console.log(err); })
    }
})
//送出表單
function sentOrder() {
    //表單驗證
    let input = document.querySelectorAll("input[type=name],input[type=tel],input[type=email],input[type=address]")
    const form = document.querySelector('.js-form');
    let constraints = {
        姓名: {
            presence: { message: "必須填" },
        },
        電話: {
            length: {
                minimum: 10,
                message: "長度要10瑪"
            },
            presence: { message: "必須填" },
        },
        Email: {
            email: { message: "格式不正確" },
            presence: { message: "必須填" },
        },
        寄送地址: {
            presence: { message: "必須填" },
        },
    }
    //輸入表單改變時
    input.forEach(function (item) {
        item.addEventListener('change', function (e) {
            item.nextElementSibling.textContent = "";
            const errors = validate(form, constraints);
            if (errors) {
                Object.keys(errors).forEach(function (keys) {
                    document.querySelector(`[data-message=${keys}]`).textContent =
                        errors[keys];
                })
            }
        })
    })
    //送出表單
    let formSend = document.querySelector('.js-formSend');
    formSend.addEventListener('click', function (e) {
        e.preventDefault();
        if (cartsList.length == 0) {
            Swal.fire(
                '購物車沒有商品',
                '',
                'error'
            )
            return
        }
        input.forEach(function (item) {
            item.nextElementSibling.textContent = "";
            const errors = validate(form, constraints);
            if (errors) {
                Object.keys(errors).forEach(function (keys) {
                    document.querySelector(`[data-message=${keys}]`).textContent =
                        errors[keys];
                })
            }
        }
        )
        let customerName = document.querySelector('#name').value;
        let customerPhone = document.querySelector('#tel').value;
        let customerEmail = document.querySelector('#email').value;
        let customerAddress = document.querySelector('#address').value;
        let tradeWay = document.querySelector('#transaction').value;
        let data = {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay
        }
        let newData = {
            "data": {
                "user": {
                    "name": customerName,
                    "tel": customerPhone,
                    "email": customerEmail,
                    "address": customerAddress,
                    "payment": tradeWay
                }
            }
        }

        if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == "") {
            Swal.fire(
                '請填入訂單資訊',
                '',
                'error'
            )
            return
        }

        let orderUrl = "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/think/orders";
        axios.post(orderUrl, newData).then(function (res) {
            Swal.fire(
                '訂單送出成功',
                '',
                'success'
            )
            getCartsList();
        })
            .catch(function (err) { console.log(err); })
        form.reset();

    })
}
sentOrder();
// util js、元件
// 千分位設計
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

document.querySelector('.jq-goTop').addEventListener('click',function(e){
    e.preventDefault();
    window.scroll({
        top: 0,
        behavior: "smooth"
      });
})
