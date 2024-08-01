"use client";

import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  // userId: string;
  courseId: string;
  // coursePrice: number;
};
const BuyCourse = ({
  coursePrice,
  courseId,
  userId,
  email,
  userName,
}: Props) => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Course purchase in progress");
  const router = useRouter();

  const onPayment = async () => {
    setButtonLoading(true);

    const orderData = {
      courseId,
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

  const [checkForEnroll, setCheckForEnroll] = useState(false);
  let checkId: NodeJS.Timeout;
  const makePayment = async (paymentData: PaymentData) => {
    try {
      const res = await initializeRazorpay();

      if (!res) {
        alert("Razorpay SDK Failed to load");
        return;
      }

      const paymentRes: any = await fetch("/api/razorpay", {
        method: "POST",
        body: JSON.stringify({ courseId: paymentData.courseId }),
      });

      const paymentResData = await paymentRes.json();

      var options = {
        key: process.env.RAZORPAY_KEY,
        name: "Course Platform",
        currency: paymentResData.currency,
        amount: +paymentResData.amount,
        order_id: paymentResData.id,
        description: "Thankyou for your payment.",

        prefill: {
          name: userName,
          email: email,
        },
        handler: () => {
          setButtonText("Processing Payment");
          checkId = setInterval(async () => {
            const res = await fetch(`/api/enroll/check?courseId=${courseId}`);
            const resData = await res.json();
            if (res.status === 200) {
              setButtonLoading(false);
              router.refresh();
              setCheckForEnroll(true);
            }
          }, 5000);
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      // setButtonLoading(false);
      router.refresh();
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(checkId);
    };
  }, []);

  return (
    <div>
      <button
        disabled={buttonLoading}
        onClick={onPayment}
        className="px-8 my-2 hover:bg-blue-600 text-white bg-blue-700 py-3  rounded-full flex items-center justify-center gap-2"
      >
        {buttonLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            {buttonText}
          </>
        ) : (
          <p>Buy the course {formatPrice(coursePrice as number)}</p>
        )}
      </button>
    </div>
  );
};

export default BuyCourse;
