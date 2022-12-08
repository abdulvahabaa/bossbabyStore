
$("#couponCode").submit((e)=>{
  e.preventDefault()
  alert("called")
  $.ajax({
    

  url:'/couponCheck',
  method:'post',
  data:$('#couponCode').serialize(),
  success:(response)=>{
    alert('success')
    alert(response.discountAmount)
    let procoupenDiscount = document.getElementById('totalDiscount').innerHTML
    let totalDiscountt = parseInt(procoupenDiscount)+parseInt(response.discountAmount)

    document.getElementById('totalDiscount').innerHTML=totalDiscountt
    document.getElementById('finalAmount').innerHTML = response.dicountedTotalPrice
    
    document.getElementById('totalAfterDiscount').value=response.dicountedTotalPrice
    document.getElementById('discountRate').value=response.dicountedTotalPrice

    
  }

  })
})