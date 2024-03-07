import Razorpay from "razorpay";

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  console.log("called", {
    key_id: process.env.RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const { totalPrice } = await request.json();

  const payment_capture = 1;
  const amount = totalPrice;
  const currency = "INR";
  const options = {
    amount: (amount * 100).toString(),
    currency,
    receipt: crypto.randomUUID(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    return Response.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log("err while payment razorpay", err);
    Response.json(err, { status: 400 });
  }
}
