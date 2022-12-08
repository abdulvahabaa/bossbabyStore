function changeQuantity(cartId, proId, userId, count, quantity) {
  // alert("ddddddddddddiii");
  // quantity = parseInt(document.getElementById(proId).innerHTML);
  // count = parseInt(count);
  // alert(quantity);
  
  $.ajax({
    url: '/change-product-quantity',
    data: {
      cart: cartId,
      product: proId,
      userId: userId,
      count: count,
      quantity: quantity,
    },
    method: 'post',
    success: (response) => {
     
      
      {
        
      // let count2 = parseInt(document.getElementById(proId).innerHTML) + parseInt(count) ;
      //   document.getElementById(proId).innerHTML = count2
      //   document.getElementById('total').innerHTML=response.total


      //   // document.location.reload()
        
      
     $("#cartReload").load(window.location.href + ' #cartReload') 
      }
    },
  });
}
