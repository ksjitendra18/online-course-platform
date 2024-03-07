"use client";

import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";

interface Props {
  coursePrice: number | null;
  userId: string;
  courseId: string;
  userName: string;
  email: string;
}
declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentData = {
  userId: string;
  courseId: string;
  coursePrice: number;
};
const BuyCourse = ({
  coursePrice,
  courseId,
  userId,
  email,
  userName,
}: Props) => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const router = useRouter();

  const onPayment = async () => {
    setButtonLoading(true);
    const orderData = {
      userId,
      courseId,
      coursePrice: coursePrice!,
    };

    makePayment(orderData);
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      // document.body.appendChild(script);

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const makePayment = async (paymentData: PaymentData) => {
    try {
      const res = await initializeRazorpay();

      if (!res) {
        alert("Razorpay SDK Failed to load");
        return;
      }

      const paymentRes: any = await fetch("/api/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ totalPrice: paymentData.coursePrice }),
      });

      const paymentResData = await paymentRes.json();

      console.log("paymentRes", paymentRes, paymentResData);

      var options = {
        key: process.env.RAZORPAY_KEY,
        name: "Course Platform",
        currency: paymentResData.currency,
        amount: +paymentResData.amount,
        order_id: paymentResData.id,
        description: "Thankyou for your payment.",

        handler: async function (response: any) {
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              body: JSON.stringify({
                ...paymentData,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            });

            const resdata = await res.json();

            if (res.ok) {
              router.push("/my-courses");
            }
          } catch (error: any) {
            throw new Error(error, error.message);
          }
          setButtonLoading(false);
        },
        prefill: {
          name: userName,
          email: email,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log("Error while payment", error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div>
      <button
        disabled={buttonLoading}
        onClick={onPayment}
        className="px-8 my-5 hover:bg-blue-600 text-white bg-blue-700 py-3  rounded-full flex items-center justify-center gap-2"
      >
        {buttonLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            Course purchase in progress
          </>
        ) : (
          <p>Buy the course {formatPrice(coursePrice as number)}</p>
        )}
      </button>
    </div>
  );
};

export default BuyCourse;
