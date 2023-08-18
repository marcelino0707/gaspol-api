
function priceDeterminant (price, servingTypeName, servingTypePercent) {
    let result = price + (price * servingTypePercent / 100);    
    if(servingTypeName == "GoFood") {   
        result = result + 1000
    }
    return result;   
};

async function applyDiscountAndUpdateTotal(totalPrice, discount_min_purchase, discount_is_percent, discount_value) {
    try {
      if (totalPrice < discount_min_purchase) {
        const errorMessage = "Minimal pembelian untuk menggunakan diskon yaitu " + discount_min_purchase;
        throw { statusCode: 400, message: errorMessage };
      }
  
      if (discount_is_percent == true) {
        totalPrice = (totalPrice * (100 - discount_value)) / 100;
      } else {
        totalPrice -= discount_value;
      }
  
      return totalPrice;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    priceDeterminant, applyDiscountAndUpdateTotal
};