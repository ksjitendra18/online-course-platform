/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { formatPrice } from "@/lib/utils";

interface Props {
  coursePrice: number | null;
  userId: string;
  courseId: string;
  userName: string;
  email: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      const options = {
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
             await res.json();
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
        className="my-2 flex items-center justify-center gap-2 rounded-full bg-blue-700 px-8 py-3 text-white hover:bg-blue-600"
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
