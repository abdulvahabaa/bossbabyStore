function addToWishlist(proId) {
 
    $.ajax({
        url:"/addToWishlist/"+proId,
        method:'get',
      success: (response) => {
        if (response.status) {
      
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Added to Your Wishlist',
            showConfirmButton: false,
            timer: 1500
          })
          }
      
        }
    })
}


function deleteWishlist(proId) {

  $.ajax({
    url: '/deleteWishlist/' + proId,
    method: 'post',
    success: (response) => {
      if (response.status) {
      
        Swal.fire(
          'Deleted..',
          'Go to wishlist!',
          'success'
        )
        location.reload()
      }
      

    }
  })
}