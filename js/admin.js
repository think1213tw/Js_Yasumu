const apiPath = "think";
const baseUrl = "https://hexschoollivejs.herokuapp.com";
const token = { headers: { Authorization: 'If7blzXLoAg6E3LWYZIbj3E3v9N2' } }
//初始化資料
let orderData = [];
//綁定dom
const table = document.querySelector('.js-table');
const allDel=document.querySelector('.jsDel');
const selectItem=document.querySelector('.js-selectItem');
const sectionTitle=document.querySelector('.section-title');
//初始化網頁
function init() {
  getOrderList();
}
init()
//取得訂單資料
function getOrderList() {
  const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
  axios.get(url, token).then(function (res) {
    renderOrderList(res);
  })
}
//渲染訂單資料到網頁上
function renderOrderList(res) {
  orderData = res.data.orders;
  let str = '';
  orderData.forEach(function (item) {
    //組訂單品項
    let productStr = '';
    item.products.forEach(function (item) {
      productStr += `${item.title}X${item.quantity}<br>`;
    })
     //抓取當前日期
    new Date();
    const timeStamp = new Date(item.createdAt * 1000);
    const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`
    //訂單狀態字串
    let orderStatus='';
    if ( !item.paid) {
      orderStatus = "未處理"
  } else {
      orderStatus = "已處理"
  }
    str += ` <tr>
    <td scope="row" class="font-weight-normal">${item.id}</td>
    <td>${item.user.name}</td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>${productStr}</td>
    <td>${orderTime}</td>
    <td><a class="nav-link p-0  h6 js-orderStatus" href="#" data-id=${item.id} data-status="${item.paid}">${orderStatus}</a> </td>
    <td> <a href="#" class="material-icons text-dark nav-link p-0 " data-del="del" data-id="${item.id}">
        delete_outline
      </a>         
  </tr>`
  })
  table.innerHTML = str;
  renderAllType();
  selectItem.addEventListener('change',function(e){
    if(e.target.value =="全產品類別營收比重"){
      renderAllType();
      sectionTitle.innerHTML=` <h2 class="section-title text-center font-weight-bold pb-3">全產品類別營收比重</h2>`
    }else{
      renderAllProduct();
      sectionTitle.innerHTML=` <h2 class="section-title text-center font-weight-bold pb-3">全品項營收比重</h2>`
    }
  })
}
//監聽點選到未處理和垃圾桶icon
table.addEventListener('click',function(e){
  e.preventDefault();
  let id =e.target.dataset.id;
  //判斷點選到狀態
  if(e.target.getAttribute("class")=="nav-link p-0  h6 js-orderStatus"){
    let status =e.target.dataset.status;
    let str ;
    if(status =="true"){
      str =false;
    }else{
      str =true;
    }
    const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
    let data ={
      "data": {
        "id": id,
        "paid": str
      }
    };

    axios.put(url,data,token).then(function (res) {
      Swal.fire(
        '狀態修改成功',
        '',
        'success'
      )
      renderOrderList(res)
  }).catch(function (err) { console.log(err); })
  }

  //判斷點選到垃圾桶icon
  if(e.target.dataset.del =="del"){
    const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders/${id}`;
    axios.delete(url,token).then(function(res){
      Swal.fire(
        '單筆訂單刪除完成',
        '',
        'success'
      )
      renderOrderList(res)
    })
  }
  
})
//全部訂單刪除
allDel.addEventListener('click',function(e){
  if(orderData.length == 0){
    Swal.fire(
      '目前沒有訂單',
      '',
      'error'
    )
    return
  }
  const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
    axios.delete(url,token).then(function(res){
      Swal.fire(
        '訂單已清空',
        '',
        'success'
      )
      renderOrderList(res)
    }).catch(function (err) { console.log(err); })
})
//全產品類別營收比重圖表
function renderAllType(){
  let renderAllTypeObj ={};
  orderData.forEach(function(item){
    item.products.forEach(function(item){
      if(renderAllTypeObj[item.category] ==undefined){
        renderAllTypeObj[item.category] =item.price * item.quantity;
      }else{
        renderAllTypeObj[item.category] +=item.price * item.quantity;
      }
    
    })
  })
  let newRenderAllAry=Object.keys(renderAllTypeObj);
  let RenderAllAry=[];
  newRenderAllAry.forEach(function(item){
    let ary=[];
    ary.push(item);
    ary.push(renderAllTypeObj[item]);
    RenderAllAry.push(ary);
  })
  c3.generate({
  
    bindto: '#chart',
    data: {
      columns:RenderAllAry,
      type: 'pie',
    },
    color: {
      pattern: ["#C5946E", "#9D6B44", "#E1965C", "#744119"]
    }
  });
}
//全品項營收比重
function renderAllProduct(){
  let renderAllProductObj ={};
  orderData.forEach(function(item){
    item.products.forEach(function(item){
      if(renderAllProductObj[item.title] ==undefined){
        renderAllProductObj[item.title] =item.price * item.quantity;
      }else{
        renderAllProductObj[item.title] +=item.price * item.quantity;
      }
    
    })
    
  })
  
  let renderAllProductAry=Object.keys(renderAllProductObj);
  let newAllProductAry=[];
  renderAllProductAry.forEach(function(item){
    let ary=[];
    ary.push(item);
    ary.push(renderAllProductObj[item]);
    newAllProductAry.push(ary);
  })

  newAllProductAry.sort(function(a,b){
    return b[1] - a[1]
  })

  if(newAllProductAry.length>3){
    let otherTotal =0;
    newAllProductAry.forEach(function(item,index){
      if(index>2){
        otherTotal += item[1]
      }
    })
    newAllProductAry.splice(3)
    newAllProductAry.push(['其他',otherTotal])
   
  }


  c3.generate({
  
    bindto: '#chart',
    data: {
      columns:newAllProductAry,
      type: 'pie',
    },
    color: {
      pattern: ["#C5946E", "#9D6B44", "#744119","#E1965C"]
    }
  });
}



