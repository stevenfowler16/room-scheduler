function formatDate(date,dateOptions){
    
    let dateFormat;
    if(dateOptions){
        dateFormat = new Intl.DateTimeFormat('en-US',dateOptions);
    }
    else{
        dateFormat = new Intl.DateTimeFormat('en-US',{dateStyle:"medium",timeStyle:'medium'});
    }
    try{
      return dateFormat.format(date);
    }
    catch{
      return "";
    }    
  }



  export {formatDate}