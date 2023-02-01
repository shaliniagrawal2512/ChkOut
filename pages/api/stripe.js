import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51MTVfqSE4D3Cmk1ltDbkGEhsMANSP4L0OwVuGRf7OhLNsbK24JfMM9phF1HFLFpmWOqJCr24rF594zoBGHPtGQG800Gd5ssJTY');

export default async function handler(req, res) {

    if (req.method === 'POST') {
        try {
            const params = {
                submit_type: 'pay',
                mode: 'payment',
                payment_method_types: ['card'],
                billing_address_collection: 'auto',
                shipping_options: [
                    { shipping_rate: 'shr_1MVutRSE4D3Cmk1lWBlcZWW8' },
                    // { shipping_rate: 'shr_1MVuuWSE4D3Cmk1lxd1roOV7' },

                ],
                line_items: req.body.map((item) => {
                    const img = item?.image[0].asset._ref;
                    const newImage = img?.replace('image-', 'https://cdn.sanity.io/images/okzbofja/production/').replace('-webp', '.webp');
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item?.name,
                                images: [newImage],
                            },
                            unit_amount: item?.price * 100,
                        },
                        adjustable_quantity: {
                            enabled: true,
                            minimum: 1,
                        },
                        quantity: item?.quantity
                    }
                }),
                success_url: `${req.headers.origin}/success=true`,
                cancel_url: `${req.headers.origin}/canceled=false`,
            }

            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create(params);

            res.status(200).json(session);
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}