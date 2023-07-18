import { NextApiRequest, NextApiResponse } from "next";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.NEXT_PUBLIC_ACCESS_TOKEN,
});

const handler = async (req, res) => {
  if (req.method === "POST") {
    //const product: IProduct = req.body.product;

    const URL = "https://c396-2800-a4-24dd-3600-8945-1274-3b00-f26.ngrok-free.app";

    try {
      console.log('CART ITEMS: ', req.body)
      console.log('REQ HEADERS ORIGIN: ', req.headers.origin)

      const preference = {

        items: req.body.map((item) => {
          const img = item.image[0].asset._ref
          const newImage = img.replace('image-', 'https://cdn.sanity.io/images/ux8r9d2h/production/').replace('-webp', '.webp')

          console.log('IMAGE', newImage)

          return {
            title: item.name,
            picture_url: newImage,
            currency_id: 'USD',
            unit_price: item.price,
            quantity: item.quantity
          }
        }),
        auto_return: "approved",
        binary_mode: true,
        back_urls: {
          success: `${req.headers.origin}/success`,
          failure: `${req.headers.origin}/canceled`,
        },
        notification_url: `${URL}/api/notify`,
      };

      const response = await mercadopago.preferences.create(preference);

      res.status(200).send({ url: response.body.init_point });
    } catch (error) {
      console.log(error)
    }
  } else {
    res.status(400).json({ message: "Method not allowed" });
  }
};

export default handler;