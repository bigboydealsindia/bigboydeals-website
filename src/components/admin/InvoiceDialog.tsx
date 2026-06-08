"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function InvoiceDialog({
  isOpen,
  onClose,
  invoiceData,
  storeInfo,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
  storeInfo: any;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_BBD_${invoiceData?.order?.id}`,
    onAfterPrint: () => toast.success("Invoice generated successfully!"),
  });

  if (!invoiceData) return null;

  const { order, user, items } = invoiceData;

  const isOnline =
    order.paymentMethod === "razorpay" || order.paymentMethod === "online";
  const orderTotal = Number(order.totalAmount || 0);

  // FIX: Removed hardcoded 100, replaced with dynamic codAdvancePaid from database
  const advancePaid = Number(order.codAdvancePaid || 0);
  const amountPaid = isOnline ? orderTotal : advancePaid;
  const balanceDue = isOnline ? 0 : orderTotal - advancePaid;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] lg:max-w-4xl rounded-2xl p-0 overflow-hidden bg-background flex flex-col h-[90vh] border-border">
        <DialogHeader className="p-5 border-b border-border flex flex-row items-center justify-between shrink-0 z-10">
          <div>
            <DialogTitle className="text-xl font-bold">
              Invoice Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review and download the compact order invoice.
            </DialogDescription>
          </div>
          <Button
            onClick={() => handleDownloadPDF()}
            size="sm"
            className="gap-2 font-bold rounded-md h-9 px-5"
          >
            <Download size={16} /> Print / Save PDF
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-secondary/20 p-4 md:p-8 flex justify-center">
          {/* COMPACT INVOICE CONTAINER */}
          <div
            ref={invoiceRef}
            className="bg-white text-black shadow-xl shrink-0 border border-gray-200"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "10mm 15mm",
            }}
          >
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              .invoice-font { font-family: 'Inter', sans-serif; }
            `,
              }}
            />

            <div className="invoice-font">
              {/* Header */}
              <div className="flex justify-between items-end mb-6 border-b border-gray-300 pb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
                    Big Boy Deals
                  </h1>
                  <p className="text-[11px] font-medium text-gray-600 leading-tight">
                    {storeInfo?.address || "123 Fashion St, New Delhi, India"}
                  </p>
                  <p className="text-[11px] font-medium text-gray-600 leading-tight">
                    {storeInfo?.email || "support@bigboydeals.com"} |{" "}
                    {storeInfo?.phone || "+91 0000000000"}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest mb-1">
                    Invoice
                  </h2>
                  <p className="text-[13px] font-bold text-gray-800">
                    Order ID: #{order.id}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Date:{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Billed To:
                  </h3>
                  <p className="font-bold text-gray-900 text-sm mb-0.5">
                    {user?.fullName || "Guest"}
                  </p>
                  <p className="text-[11px] font-medium text-gray-700 leading-snug">
                    {order.shippingAddress?.street}
                    <br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pin}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Contact:
                  </h3>
                  <p className="text-[11px] font-medium text-gray-700 mb-0.5">
                    {user?.email || "N/A"}
                  </p>
                  <p className="text-[11px] font-medium text-gray-700">
                    {user?.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Tight Invoice Table */}
              <table className="w-full text-left mb-6 border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-y border-gray-300">
                    <th className="py-2 px-3 font-bold text-gray-800 text-[11px] w-[50%] uppercase tracking-wider">
                      Item Description
                    </th>
                    <th className="py-2 px-3 font-bold text-gray-800 text-[11px] text-center uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="py-2 px-3 font-bold text-gray-800 text-[11px] text-right uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="py-2 px-3 font-bold text-gray-800 text-[11px] text-right uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {items.map((itemObj: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900 text-[12px]">
                          {itemObj.product?.name || "Product Name"}
                        </p>
                        <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                          {itemObj.variant?.color &&
                            `Color: ${itemObj.variant.color}`}
                          {itemObj.variant?.size &&
                            ` | Size: ${itemObj.variant.size}`}
                        </p>
                        {/* NAYA FIELD: Supplier Info rendered in Invoice */}
                        {itemObj.product?.supplierName && (
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                            Supplier: {itemObj.product.supplierName}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-[12px] font-bold text-gray-800">
                        {itemObj.item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-[12px] font-bold text-gray-800">
                        ₹
                        {Number(itemObj.item.priceAtPurchase).toLocaleString(
                          "en-IN",
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-[12px] font-black text-gray-900">
                        ₹
                        {(
                          Number(itemObj.item.priceAtPurchase) *
                          itemObj.item.quantity
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Compact Summary & Payment Status */}
              <div className="flex justify-between items-start mb-8">
                <div className="w-[40%] p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Payment Info
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 mb-1.5">
                    <span className="uppercase tracking-wide">
                      {isOnline ? "ONLINE PAY" : "COD"}
                    </span>
                    {isOnline ? (
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[3px] text-[9px] tracking-wider">
                        PAID
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-[3px] text-[9px] tracking-wider">
                        PARTIAL
                      </span>
                    )}
                  </div>
                  {order.razorpayPaymentId && (
                    <p className="text-[9px] font-medium text-gray-500 break-all">
                      Txn ID: {order.razorpayPaymentId}
                    </p>
                  )}
                </div>

                <div className="w-[35%]">
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-[11px] font-bold text-gray-600">
                      Subtotal
                    </span>
                    <span className="text-[11px] font-bold text-gray-900">
                      ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-[11px] font-bold text-gray-600">
                      Shipping
                    </span>
                    <span className="text-[11px] font-bold text-green-600">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-black text-gray-900 uppercase">
                      Total
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="bg-gray-900 text-white p-3 rounded-lg mt-1 shadow-sm">
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-gray-300 font-medium">
                        Amount Paid
                      </span>
                      <span className="font-bold text-white">
                        ₹{amountPaid.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px] font-bold pt-1.5 border-t border-gray-700">
                      <span className="text-gray-300">Balance Due</span>
                      <span
                        className={isOnline ? "text-green-400" : "text-red-400"}
                      >
                        ₹{balanceDue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-xs font-bold text-gray-900 mb-0.5">
                  Thank you for your business!
                </p>
                <p className="text-[10px] font-medium text-gray-500">
                  If you have any questions concerning this invoice, contact our
                  support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
