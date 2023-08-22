
function priceDeterminant (price, servingTypeName, servingTypePercent) {
    let result = price + (price * servingTypePercent / 100);    
    if(servingTypeName == "GoFood") {   
        result = result + 1000
    }
    return result;   
};

async function applyDiscountAndUpdateTotal(price, is_percent, value, min_purchase, max_discount) {
    try {
      if (price < min_purchase) {
        const errorMessage = "Minimal pembelian untuk menggunakan diskon yaitu " + min_purchase;
        throw { statusCode: 400, message: errorMessage };
      }
  
      if (is_percent == true) {
        discount = price * value / 100;
        if(discount > max_discount) {
          discount = max_discount;
        }
        price -= discount;
      } else {
        price -= value;
      }
  
      return price;
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    priceDeterminant, applyDiscountAndUpdateTotal
};