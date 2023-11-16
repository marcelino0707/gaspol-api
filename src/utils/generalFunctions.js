const moment = require("moment-timezone");
const thisTimeNow = moment();
const indoDateTime = thisTimeNow.tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"); 
function priceDeterminant(price, servingTypeName, servingTypePercent) {
  let result = price + (price * servingTypePercent) / 100;
  if (servingTypeName == "GoFood") {
    result = result + 1000;
  }
  return result;
}

async function applyDiscountAndUpdateTotal(
  price,
  qty,
  is_percent,
  value,
  min_purchase,
  max_discount,
  is_discount_cart,
  subtotal
) {
  try {
    if (is_discount_cart == true || is_discount_cart == 1) {
      if (subtotal < min_purchase) {
        const errorMessage =
          "Minimal pembelian untuk menggunakan diskon yaitu " + min_purchase;
        throw { statusCode: 400, message: errorMessage };
      }

      if (is_percent == true || is_percent == 1) {
        discount = (subtotal * value) / 100;
        if (discount > max_discount) {
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
        const errorMessage =
          "Minimal total pembelian menu untuk menggunakan diskon yaitu " +
          min_purchase;
        throw { statusCode: 400, message: errorMessage };
      }

      if (is_percent == true || is_percent == 1) {
        discount = (minPurchase * value) / 100;
        if (discount > max_discount) {
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

function formatDate(isoDate) {
  const date = indoDateTime(isoDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  return formattedDate;
}

function generateFormattedDate() {
  const year = indoDateTime.getFullYear();
  const month = (indoDateTime.getMonth() + 1).toString().padStart(2, "0");
  const day = indoDateTime.getDate().toString().padStart(2, "0");
  const hours = indoDateTime.getHours().toString().padStart(2, "0");
  const minutes = indoDateTime.getMinutes().toString().padStart(2, "0");
  const seconds = indoDateTime.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  priceDeterminant,
  applyDiscountAndUpdateTotal,
  formatDate,
  generateFormattedDate,
};
