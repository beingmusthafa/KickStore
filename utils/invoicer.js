//Import the library into your project
var easyinvoice = require("easyinvoice");

// const generateInvoice = async (user, orders) => {
//   let productArray = [];
//   for (const order of orders) {
//     let product = {
//       "quantity": order.quantity,
//       "description": `${order.product.brand} ${order.product.name}`,
//       "price": order.product.finalPrice,
//       "tax-rate": 0,
//     };
//     productArray.push(product);
//   }
//   var data = {
//     // Customize enables you to provide your own templates
//     // Please review the documentation for instructions and examples
//     customize: {
//       //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
//     },
//     images: {
//       // The logo on top of your invoice
//       "logo":
//         "https://res.cloudinary.com/dfezowkdc/image/upload/v1697033476/letter-k-white_npzdd9.png",
//       // The invoice background
//     },
//     // Your own data
//     sender: {
//       "company": "KickStore Ltd.",
//       // address: "Sample Street 123",
//       // zip: "1234 AB",
//       // city: "Sampletown",
//       // country: "Samplecountry",
//       //"custom1": "custom value 1",
//       //"custom2": "custom value 2",
//       //"custom3": "custom value 3"
//     },
//     // Your recipient
//     client: {
//       "company": user.name,
//       "address": user.email,
//       "country": user.phone,
//       // "custom1": "custom value 1",
//       // "custom2": "custom value 2",
//       // "custom3": "custom value 3"
//     },
//     information: {
//       // Invoice number
//       "number": orders[0].orderId,
//       // Invoice data
//       "date": Date.now().toLocaleString("en-US"),
//       // Invoice due date
//       // "due-date": "31-12-2021",
//     },
//     // The products you would like to see on your invoice
//     // Total values are being calculated automatically
//     "products": productArray,
//     // The message you would like to display on the bottom of your invoice
//     "bottom-notice": "Thank you for shopping with us.",
//     // Settings to customize your invoice
//     settings: {
//       "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
//       // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
//       // "margin-top": 25, // Defaults to '25'
//       // "margin-right": 25, // Defaults to '25'
//       // "margin-left": 25, // Defaults to '25'
//       // "margin-bottom": 25, // Defaults to '25'
//       // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
//       // "height": "1000px", // allowed units: mm, cm, in, px
//       // "width": "500px", // allowed units: mm, cm, in, px
//       // "orientation": "landscape", // portrait or landscape, defaults to portrait
//     },
//   };

//   //Create your invoice! Easy!
//   await easyinvoice.createInvoice(data, function (result) {
//     //The response will contain a base64 encoded PDF file
//     const buffer = Buffer.from(result.pdf, "base64");
//     return buffer;
//   });
// };

async function generateInvoice(user, orders) {
  // Create a new invoice object.
  const invoice = new easyinvoice();

  // Set the invoice sender and recipient data.
  invoice.sender = {
    company: "Your Company Name",
    address: "Your Company Address",
    city: "Your Company City",
    state: "Your Company State",
    zip: "Your Company Zip Code",
  };

  invoice.recipient = {
    name: user.name,
    email: user.email,
  };

  // Add the order items to the invoice.
  for (const order of orders) {
    invoice.addItem({
      description: order.product.name,
      quantity: order.quantity,
      price: order.product.finalPrice,
    });
  }

  // Generate the invoice PDF data.
  const invoiceData = await invoice.createInvoice();

  // Return the invoice PDF data.
  return invoiceData.pdf;
}

module.exports = { generateInvoice };
