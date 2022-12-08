function deleteAddress(addressId) {
 alert("@@@@@@@@@@@@@@@@@@@@@adddress")
  $.ajax({

    url: '/deleteAddress/' + addressId,
    method: 'post',
    success: (response) => {
     
        Swal.fire(
          'Address Removed',
          'Go to Cart!',
          'success'
        )
        location.reload()
      
    }
  })
}

