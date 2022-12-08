function addToCart(proId) {
  
    $.ajax({
        url:"/addTocart/"+proId,
        method:'get',
      success: (response) => {
        if (response.status) {
          let count = $('#cart-count').html()
         
          count = parseInt(count) + 1
        
          // $('#cart-count').html() = (count)
          document.getElementById('cart-count').innerHTML = count;
          Swal.fire(
            'Added to Cart',
            'Go to Cart!',
            'success'
          )
          }
      
        }
    })
}


function deleteToCart(proId) {
 
  $.ajax({
    url: '/deleteToCart/' + proId,
    method: 'post',
    success: (response) => {
      if (response.status) {
        Swal.fire(
          'Product Removed',
          'Go to Cart!',
          'success'
        )
        location.reload()
      }
    }
  })
}
