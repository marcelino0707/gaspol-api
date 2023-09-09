
function priceDeterminant (price, servingTypeName, servingTypePercent) {
    let result = price + (price * servingTypePercent / 100);    
    if(servingTypeName == "GoFood") {   
        result = result + 1000
    }
    return result;   
};

async function applyDiscountAndUpdateTotal(price, qty, is_percent, value, min_purchase, max_discount, is_discount_cart, subtotal) {
    try {
      if (is_discount_cart == true || is_discount_cart == 1) {
        if (subtotal < min_purchase) {
          const errorMessage = "Minimal pembelian untuk menggunakan diskon yaitu " + min_purchase;
          throw { statusCode: 400, message: errorMessage };
        } 
        
        if (is_percent == true || is_percent == 1) {
          discount = subtotal * value / 100;
          if(discount > max_discount) {
            discount = max_discount;
          }
          subtotal -= discount;
        } else {
          subtotal -= value;
        }
    
        return subtotal;        
      } else {
        const minPurchase = price * qty;
        let discountedPrice;
        if (minPurchase < min_purchase) {
          const errorMessage = "Minimal total pembelian menu untuk menggunakan diskon yaitu " + min_purchase;
          throw { statusCode: 400, message: errorMessage };
        }

        if (is_percent == true || is_percent == 1) {
          console.log("masuk percent");
          discount = minPurchase * value / 100;
          if(discount > max_discount) {
            discount = max_discount;
          }
          discountedPrice = minPurchase - discount;
        } else {
          discountedPrice = minPurchase - value;
        }
    
        return discountedPrice;
      }
    } catch (error) {
      throw error;
    }
  }

module.exports = {
    priceDeterminant, applyDiscountAndUpdateTotal
};